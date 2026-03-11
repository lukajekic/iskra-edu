export const validateTaskLanguage = (language) =>{

    let supported = ['python']

    if (supported.includes(language)) {
        return true
    }
    else{
        return false
    }
}

export const validateTaskOutput = (output) =>{

    let supported = ['standard', 'matplotlib']

    if (supported.includes(output)) {
        return true
    }
    else{
        return false
    }
}