/*
  Passo a passo para se conectar com o Google Drive 
  1 passo: criar um projeto no Google Cloud Console
  2 passo: criar uma conta de serviço
  3 passo: criar a chave da conta de serviço e pegar o json gerado
  4 passo: criar uma pasta no Google Drive
  5 passo: coletar o id da pasta do Google Drive
  6 passo: adicionar o email da api do google drive na pasta de escolha
*/

// OBS: fields = data

const fs = require('fs') // FireSystem
const { google } = require('googleapis') // Google APIs

const google_api_folder_id = 'id-da-pasta-aqui' // ID da pasta que será mexida

const auth = new google.auth.GoogleAuth({ // Criar fator de autentificação / CONFIGURAÇÃO INICIAL
  keyFile: "./googledrive.json", // keyFile são as credenciais da sua API
  scopes: ['https://www.googleapis.com/auth/drive'] // Que terá acesso ao escopo do drive
})

const drive = google.drive({ // Serviço do Google Drive / CONFIGURAÇÃO INICIAL
  version: 'v3', // Utilize a v3 como versão
  auth // Adicione a autentificação
})

async function upload_file() { // Function para adicionar arquivo
  try {
    const file_meta_data = { // Const para definir como será enviado para tal pasta
      'name': 'charizardfoda.png', // Aqui, mexa no nome do arquivo que será adicionado lá
      'parents': [google_api_folder_id] // Parentes == pasta que será adicionado
    }

    const media = { // Arquivo
      mimeType: 'image/png', // Tipo do arquivo
      body: fs.createReadStream('.assets/img/charizard.png') // Arquivo em si
    }

    const response = await drive.files.create({ // Criando o arquivo (utilize o método create)
      resource: file_meta_data, // Utilizará qual recurso? Quais serão os parâmetros?
      media: media, // Qual arquivo será adicionado?
      fields: 'id' // Solicita o id da resposta (data)
    })

    return response.data.id // Retorna o ID do arquivo criado
  }
  catch (error) { // Caso der algum erro...
    console.log('Erro criando arquivo: ', error)
  }
}

async function list_files() { // Function para listar arquivos
  try {
    const response = await drive.files.list({ // Listar arquivos (utilize o método list)
      pageSize: 10, // Número máximo de arquivos retornados
      fields: 'nextPageToken, files(id, name)', // Next page token é que, caso tenha mais que o pageSize, irá mostrar os arquivos (id, name)
      q: `'${google_api_folder_id}' in parents`, // Query para listar arquivos de uma pasta específica
    })

    const files = response.data.files // Pegando os arquivos nos dados
    if (files.length) { // Se files.length (ou seja, se existir e for diferente de 0)
      console.log('Arquivos:')
      files.map((file) => {
        console.log(`${file.name} (${file.id})`) // Mostra todos os arquivos
      })
    } else {
      console.log('Não foi encontrado arquivos') // Senão encontrar nenhum arquivo...
    }
  } catch (error) {
    console.error('Erro em listar aquivos: ', error) // Caso der algum erro...
  }
}

async function get_file_meta_data(fileId) { // Function para pegar os dados de um arquivo
  try {
    const response = await drive.files.get({ // Pegar meta dados (utilize o método get)
      fileId: fileId, // fileID serve para pegar o id do arquivo que será tratado
      fields: 'id, name, mimeType', // Campos: id, nome e tipo do arquivo
    })

    console.log(`Meta dados do arquivo '${response.data.name}':`, response.data)
  } catch (error) {
    console.error('Erro em conseguir os meta dados do arquivo', error)
  }
}

async function delete_file(fileId) { // Function para deletar um arquivo
  try {
    await drive.files.delete({ // Deletar arquivo (utilize o método delete)
      fileId: fileId, // Utilize o fileId para deletar o arquivo
    })
    console.log('Arquivo deletado com sucesso')
  } catch (error) { // Caso der algum erro...
    console.error('Erro em deletar arquivo', error)
  }
}

async function update_file (fileId) { // Function para atualizar arquivo
  try {
    const file_meta_data = { // Novo nome do arquivo
      name: 'arquivo_atualizado.png' // Definindo o novo nome
    }
    const media = { // Configurando o arquivo
      mimeType: 'image/png', // Definindo o formato
      body: fs.createReadStream('.assets/img/venosauro.png') // Acessando o arquivo que será adicionado
    }
    const response = await drive.files.update({ // Const para atualizar o arquivo (utileze o método update)
      fileId: fileId, // Id do arquivo que será modificado
      resource: file_meta_data, // Novo nome do arquivo
      media: media, // Novo arquvio
      fields: 'id, name' // Data
    })

    console.log('Arquivo atualizado: ', response.data)
  }
  catch (error) { // Se der errado...
    console.log ('Erro em atualizar o arquiv: ', error)
  } 
}

async function download_file(fileId, destination) { // Function para baixar um arquivo
  try {
    const dest = fs.createWriteStream(destination) // Pegar o destino
    const response = await drive.files.get( // Const para pegar o arquivo que quer
      { fileId: fileId, alt: 'media' }, // O parâmetro 'alt' especifica que o conteúdo do arquivo será retornado diretamente; e o fileId é o ID do arquivo que quer copiar
      { responseType: 'stream' } // A resposta será os dados do arquivo
    )

    response.data
      .on('end', () => { // Evento de quando o download for concluído
        console.log('Download concluído.') // Download concluído
      })
      .on('error', err => { // Evento de quando o download não é efetuado com sucesso
        console.error('Erro durante o download: ', err) // Erro no download
      })
      .pipe(dest) // Canaliza os dados do stream de resposta para o stream de escrita do arquivo de destino
  } catch (error) { // Caso der algum erro...
    console.error('Erro ao baixar arquivo', error)
  }
}

upload_file().then(data => {
  console.log(data)
  list_files()
  //update_file('')
  // get_file_meta_data('')
  // delete_file('')
})
