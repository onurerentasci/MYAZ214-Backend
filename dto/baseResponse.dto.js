
class BaseResponse {
  constructor(code, success, message, data,validationErrors) {
    this.code = code;
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
    this.validationErrors = validationErrors;

  }

  static success(code,data) {
    return new BaseResponse(code, true, "Success", data);
  }

  static error(code,message, data) {
    return new BaseResponse(code, false, message, data);
  }
}
module.exports = BaseResponse;
