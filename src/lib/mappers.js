
const itemToUser = (obj) => {
    return {
        username: obj.Item.username.S,
        ...(obj.Item.email ? {email : obj.Item.email.S}: {} ),
        ...(obj.Item.name ? {name : obj.Item.name.S}: {} ),
        ...(obj.Item.phone ? {phone : obj.Item.phone.S}: {} )
    }
}

module.exports = {
    itemToUser
}

// let obj = {
//     "Item": {
//         "createdAt": {
//             "N": "1587650488683"
//         },
//         "username": {
//             "S": "blincho"
//         },
//         "email": {
//             "S": "levan.gagnidze@gmail.com"
//         },
//         "name": {
//             "S": "Leo Gagnidze"
//         }
//     }
// }
// console.log(itemToUser(obj));