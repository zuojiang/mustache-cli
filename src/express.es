import {output} from './index'

export function renderFile (options = {}) {
  const {
    rootTpl = '__root',
  } = options

  return (path, data, next) => {

    return new Promise((resolve, reject) => {
      next = next || function(err, html){
        if (err) {
          return reject(err)
        }
        resolve(html)
      }

      if (!data[rootTpl]) {
        data[rootTpl] = path
      }

      try {
        const html = output({
          ...options,
          config: data,
        })
        next(null, html)
      } catch (e) {
        next(e)
      }
    })
  }
}
