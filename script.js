let hamburger = document.querySelector('#hamburger');
let hamburger2 = document.querySelector('#hamburger2');
let sidebar = document.querySelector(".sidebar");
function showSidebar ()
{
    sidebar.style.display="flex";
}
function hideSidebar ()
{
    sidebar.style.display="none";

}

/*****************************************************
 ******************  Project count timer  ********************
 *****************************************************/
let projCount =document.querySelector("#proj-count");
let countTotal=parseInt(projCount.innerText);
let count = 0;
function counter()
{
    if(countTotal>=count)
    {
        projCount.innerText=count;
        count++;
    }
    else
    {
        clearInterval(projCountDelay);
        repeatCounter();
    }
    
}
let projCountDelay = setInterval(counter,100);

function repeatCounter()
{
    setTimeout(()=>{

        count=0;
        projCountDelay = setInterval(counter,100);
    },2000)
}

/*****************************************************
 ******************  type animation ********************
 *****************************************************/

 var typed = new Typed(".autoType",{
    strings : ["Programmer ","Designer ","Youtuber "],
typeSpeed :100,
backSpeed :130,
loop :true

});