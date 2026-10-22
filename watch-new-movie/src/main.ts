import fs from 'node:fs'
import axios from 'axios'

interface Movie {
  dirname: string
  filename: string
}

function getMovies(): Movie[] {
  const movies: Movie[] = []

  const parent = '/data/'
  const dataDirectories = fs
    .readdirSync(parent)
    .filter((file) => fs.statSync(parent + file).isDirectory())
  for (const dir of dataDirectories) {
    const files = fs
      .readdirSync(parent + dir)
      .filter((file) => fs.statSync(`${parent}${dir}/${file}`).isFile())
      .filter((file) => !file.includes('.f140'))
      .filter((file) => !file.includes('.f248'))
      .filter((file) => !file.includes('.f299'))
      .filter((file) => file.endsWith('.mp4'))
    for (const file of files) {
      movies.push({
        dirname: dir,
        filename: file,
      })
    }
  }
  return movies
}

/**
 * Persists the notified keys atomically so a crash mid-write cannot leave a
 * truncated notified.json.
 * @param notified - Keys (`dirname/filename`) of movies already notified
 */
function saveNotified(notified: string[]): void {
  fs.writeFileSync('/data/notified.json.tmp', JSON.stringify(notified))
  fs.renameSync('/data/notified.json.tmp', '/data/notified.json')
}

/**
 * Notifies Discord of each unnotified movie. A movie is recorded as notified
 * only after the notification succeeded, so failed movies are retried on the
 * next run.
 * @throws Error when at least one notification failed
 */
async function main() {
  const movies = getMovies()
  const notified: string[] = fs.existsSync('/data/notified.json')
    ? JSON.parse(fs.readFileSync('/data/notified.json').toString())
    : []
  const init = notified.length === 0
  const failed: string[] = []
  for (const movie of movies) {
    const key = movie.dirname + '/' + movie.filename
    if (notified.includes(key)) {
      continue
    }
    console.log(movie)

    if (init) {
      notified.push(key)
      continue
    }
    try {
      await axios.post('http://discord-deliver', {
        embed: {
          title: `Downloaded movie - youtube-live-recorder`,
          color: 0x00_ff_00,
          fields: [
            {
              name: 'Directory',
              value: `\`${movie.dirname}\``,
              inline: true,
            },
            {
              name: 'File',
              value: `\`${movie.filename}\``,
              inline: true,
            },
          ],
        },
      })
    } catch (error) {
      console.error(
        `Failed to notify ${key}: ${error instanceof Error ? error.message : String(error)}`,
      )
      failed.push(key)
      continue
    }
    notified.push(key)
    saveNotified(notified)
  }
  if (init) {
    saveNotified(notified)
    return
  }
  if (failed.length === 0) {
    return
  }
  const shown = failed.slice(0, 5).join(', ')
  const rest = failed.length > 5 ? ` and ${failed.length - 5} more` : ''
  throw new Error(`Failed to notify ${failed.length} movie(s): ${shown}${rest}`)
}

;(async () => {
  await main().catch(async (error: unknown) => {
    console.error(error)
    process.exitCode = 1
    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `Error`,
          description: (error as Error).message,
          color: 0xff_00_00,
          fields: [
            {
              name: 'Stacktrace',
              value: (error as Error).stack,
            },
          ],
        },
      })
      .catch(() => null)
  })
})()
