
const member = [
    {
        "name": "juana de arco",
        "password": "Joropo",
        "pos": 0,
        "match": null
    },
    {
        "name": "lucho chepa",
        "password": "",
        "pos": 1,
        "match": null
    },
    {
        "name": "alejandro fernadnes",
        "password": "",
        "pos": 2,
        "match": null
    },
    {
        "name": "lusita",
        "password": "",
        "pos": 3,
        "match": null
    }
]

const temp_member = [...member]
const mix_member = []
const length = member.length
for (let i = 0; i < length; i++) {

    let select = Math.floor(Math.random() * temp_member.length)
    mix_member.push(temp_member[select])
    temp_member.splice(select, 1)
}

for (let i = 0; i < length-1; i++) {
    mix_member[i].match = mix_member[i+1].name 
    console.log(mix_member[i])   
}
mix_member[length-1].match = mix_member[0].name 


console.log(member)
console.log(temp_member)
console.log(mix_member)
