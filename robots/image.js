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
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images
        

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++){
                const imageUrl = images[imageIndex]

                try{
                    //await downloadImage()
                    console.log(`> Baixou imagem com Sucesso: ${imageUrl}`)
                    break

                } catch(error){
                  console.log(`> Erro ao Baixar (${imageUrl}): ${error}`)

                }

            }
        }
    }

}

module.exports = robot