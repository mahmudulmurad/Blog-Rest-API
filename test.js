let obj =[{
    name:"a",
    num:1
},{
    name:"b",
    num:1
}]

setTimeout(() => {
    console.log('2 Second Timer')
}, 2000)

let func = (obj)=>{
    val = 0
    obj.forEach(element => {
        setTimeout(() => {
            console.log('2 Second Timer')
        val += element.num 

        }, 2000)
    });
    return val
}
console.log(func(obj));