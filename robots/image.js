const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot(){
    const content = state.load()

    await fetchImagesOfAllSentences(content)

    await downloadAllImages(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagensLinks(query)

            sentence.googleSearchQuery = query
        }
    } 
    
    
    async function fetchGoogleAndReturnImagensLinks(query){
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apikey,
            cx : googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 2
        })

        const imageUrl = response.data.items.map((item) => {
            return item.link
        })

        return imageUrl
    }     
    
    async function downloadAllImages(content){
        content.downloadedImages = []

        
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images
        

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++){
                const imageUrl = images[imageIndex]

                try{
                    if (content.downloadedImages.includes(imageUrl)){
                        throw new Error ('Imagem já foi baixada')
                    }
                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`> [${sentenceIndex}][${imageIndex}] Baixou imagem com Sucesso: ${imageUrl}`)
                    break

                    } catch(error){
                    console.log(`> [${sentenceIndex}][${imageIndex}] Erro ao Baixar (${imageUrl}): ${error}`)

                }

            }
        }
    }
    async function downloadAndSave(url, filename){
        return imageDownloader.image({
            url, url,
            dest: `./content/${filename}`
        })
    }

}

module.exports = robot