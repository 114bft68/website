const HELLOS = document.getElementById('hello-text');
let hello = [];
let helloCount = helloChar = nextHello = paused = 0; // nextHello = paused = false

/* the 1st page (hello in different languages) */
fetch('hello.json')

    .then((response) => {
    
        return response.json();
    
    })

    .then ((data) => {
        
        hello = Object.values(data);

        setInterval(() => {

            if (paused) return;
            if (helloCount >= hello.length)  helloCount = 0;
        
            if (helloChar < hello[helloCount].length && !nextHello) {
                
                HELLOS.textContent += hello[helloCount][helloChar++];
        
            } else if (helloChar >= hello[helloCount].length && !nextHello) {

                paused = 1;
        
                setTimeout(() => {
                
                    HELLOS.textContent = HELLOS.textContent.substring(0, HELLOS.textContent.length - 1);
                    if (HELLOS.textContent.length <= 0) nextHello = 1;
                    paused = 0;
                
                }, helloChar === HELLOS.textContent.length ? 1000 : 0);
        
            } else {
        
                helloCount += 1;
                helloChar = nextHello = 0;

            }

        }, 200);

    })
    
    .catch((error) => {
        
        alert(`An error has occured: ${error}`);
        console.log(error);
    
    });
/* end of the 1st page */

/* navigation bar */
const NAV_ITEMS = Array.from(document.querySelectorAll('.navitem'));
const NAVIGATE_TO = ['second', 'third', 'fourth', 'fifth'];

for (let i = 0; i < NAV_ITEMS.length - 1; i++) { // excludes the dark/ light mode switch

    NAV_ITEMS[i].addEventListener('click', () => {

        document.body.scrollTo(0, document.body.scrollTop + document.querySelector(`.page.${NAVIGATE_TO[i]}`).getBoundingClientRect().top);

    });

}
/* end of navigation bar */

/* dark/ light mode */
document.querySelectorAll('.navitem')[4].addEventListener('click', () => {

    let currentMode;

    try {

        currentMode = JSON.parse(document.documentElement.getAttribute('data-mode'));

    } catch {

        currentMode = true;

    }
    
    document.documentElement.setAttribute('data-mode', !currentMode);

});
/* end of dark/ light mode */

/* the 3rd page */
const TRACK = document.getElementById('track');
const RANK_ALL = document.getElementById('rank-all');
const RANK = document.getElementById('rank');
const SKILLS_ITEMS = document.getElementById('skills-items');

let isMobile;

let languages = {}, allLanguages = {};
// skills (languages/ language-like (html, css, etc.)) [sorted] and [not sorted]

let clickIndicator = false, clickX, thumbPosition;
// slider related stuff

let prevSelectedRankAll = RANK_ALL, prevSelectedRank = 'Beginner', selectedRank = 'Beginner';
// initial selected element = #rank-all, initial selected rank = 'Beginner'

const MY_RANKS = [['Beginner', 'yellow'],
                ['Intermediate', 'green'],
                ['Advanced', 'red']]; // 0: name, 1: color (I wouldn't use an object for 3 items)

async function fetchLanguagesJSON() {
    
    try {
    
        const response = await fetch('languages.json');
        
        languages = await response.json();
        allLanguages = Object.assign({}, languages.Beginner, languages.Intermediate, languages.Advanced);

    } catch (error) {

        alert(`An error has occured: ${error}`);
        console.log(error);

    }

}

async function skillsItemsInitialization() {

    await fetchLanguagesJSON(); 

    for (let i = 0; i < MY_RANKS.length; i++) {

        Object.entries(languages[MY_RANKS[i][0]]).forEach((e) => {
            
            createSVGContainer(e[0], e[1].svg);

        });

    }

}

skillsItemsInitialization();

async function noname(n) {

    await fetchLanguagesJSON();

    let selectedElem = document.querySelector('.selected');
    
    prevSelectedRankAll = (selectedElem === RANK_ALL);

    if (n) {

        RANK.classList.toggle('selected');
        RANK_ALL.classList.toggle('selected');

        selectedElem = document.querySelector('.selected');

    }

    if ((selectedElem === RANK_ALL && !prevSelectedRankAll) ||
        (selectedElem === RANK && ((!prevSelectedRankAll && (prevSelectedRank !== selectedRank)) || prevSelectedRankAll))) {
        
        SKILLS_ITEMS.innerHTML = '';

        document.getElementById('language-name').textContent = 'Click a random icon above ^';
        document.getElementById('language-description').textContent = 'Blah'.padEnd(200, ' blah');
        
        if (selectedElem === RANK_ALL) {

            skillsItemsInitialization();

        } else {

            const l = Object.entries(languages[selectedRank]);
        
            for (let i = 0; i < l.length; i++) {
        
                createSVGContainer(l[i][0], l[i][1].svg);
        
            }

        }

    }

}

function createSVGContainer(id, svg) {

    let c = document.createElement('div');
    c.className = 'svgContainer';
    c.id = id;
    c.innerHTML = svg;
    
    c.addEventListener('click', () => {

        const elementChosen = document.querySelector('.chosen');
        const chosen = (c === elementChosen);
        
        if (!chosen && elementChosen) elementChosen.classList.toggle('chosen');

        c.classList.toggle('chosen');

        document.getElementById('language-name').textContent =
        (!chosen ? id : 'Click a random icon above ^');

        document.getElementById('language-description').textContent =
        (!chosen ? allLanguages[id].description : 'Blah'.padEnd(200, ' blah'));

    });

    SKILLS_ITEMS.appendChild(c);

}

try {

    document.createEvent('TouchEvent');
    isMobile = true;

} catch {

    isMobile = false;

}

function sliderClick(e) {

    prevSelectedRank = selectedRank;

    const thumb = TRACK.style.getPropertyValue('--thumb-left');
    thumbPosition = (/[0-9]+/.test(thumb) ? Number(thumb.match(/[0-9]+/)[0]) : 0);
    clickX = (isMobile ? e.touches[0].clientX : e.clientX) / window.innerWidth * 100; // in unit (vw)
    clickIndicator = true;

}

function sliderMove(e) {
    
    if (clickIndicator) {

        const deltaX = (isMobile ? e.changedTouches[0].clientX : e.clientX) / window.innerWidth * 100 - clickX; // in unit (vw)
        const newThumbPos = Math.max(Math.min(thumbPosition + deltaX, 68), 0); // 73 (width of track) - 5 (width of thumb) = 68
        TRACK.style.setProperty('--thumb-left', `${newThumbPos}vw`);
        thumbPosition = newThumbPos;
        clickX = (isMobile ? e.changedTouches[0].clientX : e.clientX) / window.innerWidth * 100; // for the next move

        const targetIndex = Math.floor((thumbPosition + 2.5) / 73 * 3); // 5 (width of thumb) / 2 = 2.5
        selectedRank = MY_RANKS[targetIndex][0];
        RANK.textContent = selectedRank;
        RANK.style.color = `var(--${MY_RANKS[targetIndex][1]})`;

    }

}

function sliderUnclick() {

    if (clickIndicator) {
    
        clickIndicator = false;
        noname(0);

    }

}

TRACK.addEventListener('mousedown', sliderClick);
document.addEventListener('mousemove', sliderMove);
document.addEventListener('mouseup', sliderUnclick);

TRACK.addEventListener('touchstart', sliderClick, { passive: true });
document.addEventListener('touchmove', sliderMove);
document.addEventListener('touchend', sliderUnclick);

RANK_ALL.addEventListener('click', () => noname(1));
RANK.addEventListener('click', () => noname(1));

if (!isMobile) {

    SKILLS_ITEMS.addEventListener('wheel', (e) => {
        
        SKILLS_ITEMS.scrollLeft += e.deltaY;
        
        e.preventDefault();

    }, { passive: false });

}
/* end of the 3rd page */

/* the 4th page */
const REPOS_CONTAINER = document.getElementById('repos-grid');
const CURRENT_LINK = window.location.href;
const REPO_REGEX = /https:\/\/([a-zA-Z0-9]+)\.github\.io\/[a-zA-Z0-9]+\/?/;
const REPO_AUTHOR = CURRENT_LINK.match(REPO_REGEX);

// in case I change my username someday
fetch(`https://api.github.com/users/${REPO_REGEX.test(CURRENT_LINK) ? REPO_AUTHOR[0] : '114bft68'}/repos`)
    
    .then((response) => {
    
        return response.json();
    
    })
    
    .then((data) => {
    
        const repos = data;
        
        for (const repo of repos) {

            let c0 = document.createElement('div');
            c0.className = 'card';

            let c1 = document.createElement('div');

            let c2 = document.createElement('a');
            c2.textContent = repo['name'];
            c2.title = repo['name'];
            c2.href = repo['html_url'];
            c2.target = '__blank';

            let c3 = document.createElement('p');
            c3.textContent = ` \u{2022} ${repo['language']}`;

            c1.append(c2, c3);

            let c4 = document.createElement('p');
            c4.textContent = repo['description'];

            c0.append(c1, c4);
            REPOS_CONTAINER.appendChild(c0);

        }
    
    
    }) // name, language, description, html_url
    
    .catch((error) => {

        alert(`An error has occured: ${error}`);
        console.log(error);

        for (let i = 0; i < 10; i++) {

            let c = document.createElement('div');
            c.className = 'card';

            REPOS_CONTAINER.appendChild(c);

        }

    });
/* end of the 4th page */

/* the 5th page */
document.getElementById('form-submit').addEventListener('click', (e) => {

    for (item of ['form-first-name', 'form-last-name', 'form-email', 'form-message']) {

        if (!document.getElementById(item).checkValidity()) {

            alert('Oops, I forgot to tell you the form was fake :)');
            
            e.preventDefault();

            break;

        }

    }

});
/* end of the 5th page */