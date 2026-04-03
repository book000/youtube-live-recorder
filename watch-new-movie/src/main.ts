import fs from 'node:fs'
import axios from 'axios'

/**
 * 監視対象の動画ファイル情報です。
 */
interface Movie {
  dirname: string
  filename: string
}

/**
 * 通知対象となる MP4 ファイルの一覧を取得します。
 *
 * @returns 動画ファイル情報の一覧
 */
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
 * 未通知の動画を検出し、Discord へ通知します。
 */
async function main() {
  const movies = getMovies()
  const notified: string[] = fs.existsSync('/data/notified.json')
    ? JSON.parse(fs.readFileSync('/data/notified.json').toString())
    : []
  const init = notified.length === 0
  for (const movie of movies) {
    const key = movie.dirname + '/' + movie.filename
    if (notified.includes(key)) {
      continue
    }
    console.log(movie)
    notified.push(key)

    if (init) {
      continue
    }
    await axios
      .post('http://discord-deliver', {
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
      .catch(() => null)
  }
  fs.writeFileSync('/data/notified.json', JSON.stringify(notified))
}

;(async () => {
  await main().catch(async (err: unknown) => {
    console.error(err)
    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `Error`,
          description: (err as Error).message,
          color: 0xff_00_00,
          fields: [
            {
              name: 'Stacktrace',
              value: (err as Error).stack,
            },
          ],
        },
      })
      .catch(() => null)
  })
})()
