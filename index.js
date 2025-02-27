let myLeads = []
let folders = {}
let activeFolderId = null;

const folderNameEl = document.getElementById("folder-name")
const inputEl = document.getElementById("input-el")
const saveTextBtn = document.getElementById("save-text-btn")
const ulEl = document.getElementById("ul-el")
const dltbtn = document.getElementById("dlt-btn")
const tabBtn = document.getElementById("tab-btn")
const folderBtn = document.getElementById("create-folder-btn")
const inputBtn = document.getElementById("input-btn")
const folderSelect = document.getElementById("folder-select")
const leadsfromlocalStorage = JSON.parse(localStorage.getItem("myLeads"))
const newFolderToggle = document.getElementById("new-folder-toggle")
const folderSection = document.getElementById("folder-section")
const folderToggle = document.getElementById("folder-toggle")
const folderSaveSection = document.getElementById("folder-save-section")

const savedData = JSON.parse(localStorage.getItem("savedData")) || { leads: [] , folders: {} }
myLeads = savedData.leads
folders = savedData.folders

function updateFolderSelect() {
    folderSelect.innerHTML = '<option value="none">Select Folder</option>'
    for (let folderName in folders) {
        folderSelect.innerHTML += `
            <option value="${folderName}">${folderName}</option>
        `
    }
}
folderToggle.addEventListener("click", function() {
    folderSaveSection.classList.toggle("show")
    folderToggle.textContent = folderSaveSection.classList.contains("show") ? "Cancel" : "Save to Folder"
    if (folderSaveSection.classList.contains("show")) {
        updateFolderSelect()
    }
})
folderBtn.addEventListener("click", function() {
    const folderName = folderNameEl.value.trim()
    if (folderName && !folders[folderName]) {
        folders[folderName] = []
        folderNameEl.value = ""
        saveToStorage()
        render(myLeads)
        updateFolderSelect() // Update folder options when new folder is created
    }
})
function saveToStorage(){
    localStorage.setItem("savedData", JSON.stringify({
        leads: myLeads,
        folders: folders
    }))
}
newFolderToggle.addEventListener("click", function() {
    folderSection.classList.toggle("hidden")
    newFolderToggle.textContent = folderSection.classList.contains("hidden") ? "New Folder" : "Cancel"
})
function render(leads, currentFolder = null) {
    let listItems = ""
    
    // Create the flex container
    listItems += '<div id="content-section">'
    
    // Render folders
    listItems += '<div class="folders">'
    listItems += '<h3>Folders</h3>'
    for (let folderName in folders) {
        const isActive = folderName === activeFolderId;
        listItems += `
            <div class="folder ${isActive ? 'active' : ''}" data-folder="${folderName}">
                <h3 class="folder-title">${folderName}</h3>
                <ul class="${isActive ? 'show' : 'hidden'}">
                    ${folders[folderName].map(lead => `
                        <li>
                            <a target='_blank' href='${ensureAbsoluteUrl(lead.url)}'>
                                ${lead.title || lead.url}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `
    }
    listItems += '</div>'
    
    // Render uncategorized leads
    listItems += '<div class="uncategorized"><h3>Uncategorized</h3><ul>'
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a target='_blank' href='${ensureAbsoluteUrl(leads[i])}'>
                    ${leads[i]}
                </a>
            </li>
        `
    }
    listItems += '</ul></div>'
    listItems += '</div>' // Close content-section
    
    ulEl.innerHTML = listItems
    // Add click handlers to folder titles
    document.querySelectorAll('.folder-title').forEach(title => {
        title.addEventListener('click', (e) => {
            const folderDiv = e.target.parentElement;
            const folderName = folderDiv.dataset.folder;
            const folderContent = folderDiv.querySelector('ul');
            
            // Toggle active state
            if (activeFolderId === folderName) {
                activeFolderId = null;
                folderContent.classList.add('hidden');
                folderContent.classList.remove('show');
                folderDiv.classList.remove('active');
            } else {
                // Close previously active folder
                if (activeFolderId) {
                    const prevActive = document.querySelector(`[data-folder="${activeFolderId}"]`);
                    if (prevActive) {
                        prevActive.querySelector('ul').classList.add('hidden');
                        prevActive.querySelector('ul').classList.remove('show');
                        prevActive.classList.remove('active');
                    }
                }
                
                activeFolderId = folderName;
                folderContent.classList.remove('hidden');
                folderContent.classList.add('show');
                folderDiv.classList.add('active');
            }
            
            // Save active folder state to localStorage
            localStorage.setItem('activeFolderId', activeFolderId);
        });
    });
}
window.addEventListener('load', () => {
    // Restore active folder state
    activeFolderId = localStorage.getItem('activeFolderId');
    render(myLeads);
});

folderBtn.addEventListener("click", function() {
    const folderName = folderNameEl.value.trim()
    if (folderName && !folders[folderName]) {
        folders[folderName] = []
        folderNameEl.value = ""
        saveToStorage()
        render(myLeads)
    }
})

inputBtn.addEventListener("click", function() {
    const url = inputEl.value.trim()
    const selectedFolder = folderSelect.value   // now using folderSelect variable
    
    if (url) {
        if (selectedFolder && selectedFolder !== "none") {
            folders[selectedFolder].push({
                url: url,
                title: url,
                dateAdded: new Date().toISOString()
            })
        } else {
            myLeads.push(url)
        }
        
        inputEl.value = ""
        saveToStorage()
        render(myLeads)
    }
})

tabBtn.addEventListener("click", function(){
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        myLeads.push(tabs[0].url)
        saveToStorage()
        render(myLeads)
    })
})

saveTextBtn.addEventListener("click", function() {
    const text = inputEl.value.trim()
    if (text) {
        myLeads.push(text)
        inputEl.value = ""
        saveToStorage()
        render(myLeads)
    }
})

dltbtn.addEventListener("dblclick", function(){
    localStorage.clear()
    myLeads = []
    render(myLeads)
})

// Add this helper function to ensure URLs are absolute
function ensureAbsoluteUrl(url) {
    if (!url) return '#';
    
    // Check if the URL already starts with http:// or https://
    if (!/^https?:\/\//i.test(url)) {
        // If not, add https:// as default
        return 'https://' + url;
    }
    return url;
}