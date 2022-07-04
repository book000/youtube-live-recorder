import fs from 'fs'
import axios from 'axios'

interface Movie {
  dirname: string
  filename: string
}

async function main() {
  const movies = getMovies()
  const notified = fs.existsSync('/data/notified.json')
    ? JSON.parse(fs.readFileSync('/data/notified.json').toString())
    : []
  for (const movie of movies) {
    const key = movie.dirname + '/' + movie.filename
    if (notified.includes(key)) {
      continue
    }
    console.log(movie)
    notified.push(key)

    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `Downloaded movie - youtube-live-recorder`,
          color: 0x00ff00,
          fields: [
            {
              name: 'Directory',
              value: movie.dirname,
              inline: true,
            },
            {
              name: 'File',
              value: movie.filename,
              inline: true,
            },
          ],
        },
      })
      .catch(() => null)
  }
  fs.writeFileSync('/data/notified.json', JSON.stringify(notified))
}

function getMovies(): Movie[] {
  const movies: Movie[] = []

  const parent = '/data/'
  const dataDirectorys = fs
    .readdirSync(parent)
    .filter((file) => fs.statSync(parent + file).isDirectory())
  for (const dir of dataDirectorys) {
    const files = fs
      .readdirSync(parent + dir)
      .filter((file) => fs.statSync(`${parent}${dir}/${file}`).isDirectory())
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

;(async () => {
  await main().catch(async (err) => {
    console.error(err)
    await axios
      .post('http://discord-deliver', {
        embed: {
          title: `Error`,
          description: `${err.message}`,
          color: 0xff0000,
          fields: [
            {
              name: 'Stacktrace',
              value: err.stack,
            },
          ],
        },
      })
      .catch(() => null)
  })
})()
