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
  for (const directory of dataDirectories) {
    const files = fs
      .readdirSync(parent + directory)
      .filter((file) => fs.statSync(`${parent}${directory}/${file}`).isFile())
      .filter((file) => !file.includes('.f140'))
      .filter((file) => !file.includes('.f248'))
      .filter((file) => !file.includes('.f299'))
      .filter((file) => file.endsWith('.mp4'))
    for (const file of files) {
      movies.push({
        dirname: directory,
        filename: file,
      })
    }
  }
  return movies
}

async function main() {
  const movies = getMovies()
  const notified: string[] = fs.existsSync('/data/notified.json')
    ? JSON.parse(fs.readFileSync('/data/notified.json').toString())
    : []
  const isInitialRun = notified.length === 0
  for (const movie of movies) {
    const key = movie.dirname + '/' + movie.filename
    if (notified.includes(key)) {
      continue
    }
    console.log(movie)
    notified.push(key)

    if (isInitialRun) {
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
    } catch {
      // Discord への通知失敗は握りつぶし、通知済み管理を継続する
    }
  }
  fs.writeFileSync('/data/notified.json', JSON.stringify(notified))
}

;(async () => {
  try {
    await main()
  } catch (error) {
    console.error(error)
    try {
      await axios.post('http://discord-deliver', {
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
    } catch {
      // Discord へのエラー通知自体が失敗しても、元のエラーはログ済みのため無視する
    }
  }
})()
