var wordpress = require( "wordpress" );

async function post(content_title,contetn_content,option){
    await new Promise(async(resolve,reject)=>{
        let login = { client : wordpress.createClient(option)}
            await login.client.newPost({
                    title: content_title,
                    status: 'publish', //draft
                    type: 'post',
                    excerpt: '',
                    commentStatus: 'closed',
                    content: contetn_content
                    }, function( error, data ) {
                        if(error){console.log(error);reject()}
                        else{ resolve()　}
                    
            }); 
    })
   
}
module.exports = post