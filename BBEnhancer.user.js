// ==UserScript==
// @name         BlackBoard Enhancer
// @namespace    https://github.com/frank-xjh/BBEnhancer
// @homepageURL  https://github.com/frank-xjh/BBEnhancer
// @supportURL   https://github.com/frank-xjh/BBEnhancer/issues
// @version      0.1
// @description  A Enhancer for Blackboard
// @author       Frank
// @match        https://learn.intl.zju.edu.cn/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Locate the course menu container
    const course = document.getElementById('courseMenu_link');
    const menu = document.querySelector('#courseMenuPalette_contents');

    if (!course || !menu) {
        console.warn('Course Not Found');
        return;
    }

    const textContent = course.textContent;

    const pattern = /([A-Z]+[\d]+:)/;
    const match = textContent.match(pattern);

    if (match) {
        const courseCode = match[1]
        console.log('Course Code: ' + match[1].slice(0, -1));

        const existingItem = document.querySelector('#paletteItem-similar-courses');
        if (!existingItem) {
            // Create a new menu
            const newItem = document.createElement('li');
            newItem.className = 'clearfix';
            newItem.id = 'paletteItem-similar-courses';

            // Create a new <a> element inside the <li>
            newItem.innerHTML = `
                <a href="#">
                    <span title="Similar Courses">Similar Courses</span>
                </a>
            `;

            menu.appendChild(newItem);

            console.log('Similar Courses Menu Added');


            // Add click event to the link
            newItem.querySelector('a').addEventListener('click', async function (e) {
                e.preventDefault();
                await handleCourseSearch(courseCode);
            });
        }
    } else {
        console.warn('Course Code Not Found');
    }

    async function handleCourseSearch(courseCode) {
        const targetUrl = '/webapps/blackboard/execute/viewCatalog';

        const body = new URLSearchParams({
            type: 'Course',
            command: 'NewSearch',
            searchText: courseCode
        });

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });

            if (response.ok) {
                const responseText = await response.text();
                console.log('Search Successful');

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = responseText;

                const containerDiv = tempDiv.querySelector('#containerdiv');
                if (containerDiv) {
                    const links = containerDiv.querySelectorAll('a');
                    links.forEach(link => {
                        link.target = '_blank';  // 设置 target 属性为 "_blank"
                    });

                    // Replace
                    const targetContainer = document.querySelector('#content');

                    if (targetContainer) {
                        targetContainer.innerHTML = `
                            <div id="pageTitleDiv" class="pageTitle clearfix">
                                <div id="pageTitleBar" class="pageTitleIcon" tabindex="0">
                                    <h1 id="pageTitleHeader" tabindex="-1">
                                        <span id="pageTitleText">Similar Courses</span>
                                    </h1>
                                    <span id="_titlebarExtraContent" class="titleButtons"></span>
                                </div>
                            </div>
                        `;
                        targetContainer.appendChild(containerDiv);
                        document.querySelector('#crumb_2').innerHTML = 'Similar Courses';
                        console.log('Content Replaced');
                    } else {
                        console.error('Replaced Failed');
                    }
                } else {
                    console.error('Container Not Found');
                }
            } else {
                console.error('Search Failed:', response.status);
            }
        } catch (error) {
            console.error('Error Searching:', error);
        }
    }
})();