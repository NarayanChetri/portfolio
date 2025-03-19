// lazy load images ⬇️

document.querySelectorAll("img").forEach(img => img.setAttribute("loading", "lazy"));


/*****************************************************
 ******************  Nav bar ********************
 *****************************************************/


 let hamburger = document.querySelector('#hamburger');
let hamburger2 = document.querySelector('#hamburger2');
let sidebar = document.querySelector(".sidebar");
function showSidebar() {
    if (sidebar.classList.contains('slideleft')) {
        sidebar.classList.remove('slideleft'); // Slide out
    } else {
        sidebar.classList.add('slideleft'); // Slide in
    }
}
function hideSidebar ()
{
    if (sidebar.classList.contains('slideleft')) {
        sidebar.classList.remove('slideleft'); // Slide out
    } else {
        sidebar.classList.add('slideleft'); // Slide in
    }
}


/*****************************************************
 ******************  type animation ********************
 *****************************************************/

 var typed = new Typed(".autoType",{
    strings : ["Programmer ","Software Developer","Youtuber "],
typeSpeed :80,
backSpeed :130,
loop :true

});

////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".fade-in");
  
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add("popIn");
      }, index * 100); // Delay each element by 500ms
    });
  });
  