export const BuildValidationReturn = (message, toast, toast_message) =>{
    let returnvalue = {}
    if (message) {
        returnvalue.message = message
    }

    if (toast) {
        returnvalue.toast = toast
    }

    if (toast_message) {
        returnvalue.toast_message = toast_message
    }

    return returnvalue
}