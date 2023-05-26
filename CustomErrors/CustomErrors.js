class InvalidUrlError extends Error{
  constructor(message){
    super(message);
    this.name='InvalidUrlError';
    this.message = message;
  }

}

module.exports={
  InvalidUrlError
}