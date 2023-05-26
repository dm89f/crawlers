const { InvalidUrlError } = require('./CustomErrors/CustomErrors');
const { Axios } = require('./config/axiosInstance');
const { formatUrlString } = require('./utils/formatUrl');






// Usage
const main = () => {

  let urlStrs = ['https://example.com', 'https://www.example.com',
    'http://example.com', 'http://www.example.com',
    'www.example.com', 'example.com', 'https://example.com/gnewkbg/#fmewlkfe', 'fnewklnflw'];
    
    for(let urlStr of urlStrs){

      try{
        let formtdUrl = formatUrlString(urlStr);
        console.log(formtdUrl)
      }catch(error){
  
        if(error instanceof InvalidUrlError){
          console.log(error.message);
        }
  
      }

    }


}

main();
