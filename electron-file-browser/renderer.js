const { ipcRenderer } = require('electron');
const os = require('os');
const path = require('path');

// DOM elements
const navMenuContainer = document.getElementById('nav-menu-container');
const directoryContents = document.getElementById('directory-contents');
const currentPathElement = document.getElementById('current-path');

// DOM element for path breadcrumbs
const pathBreadcrumbsElement = document.getElementById('path-breadcrumbs');

// Current directory path
let currentPath = '/';

// Function to create path badges
function createPathBreadcrumbs(path) {
  // Split the path into segments
  const segments = path.split('/').filter(segment => segment !== '');
  const breadcrumbsContainer = document.getElementById('path-breadcrumbs');
  breadcrumbsContainer.innerHTML = ''; // Clear existing badges

  // Create the root badge
  const rootBadge = document.createElement('span');
  rootBadge.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-blue-200';
  rootBadge.textContent = '/';
  rootBadge.dataset.path = '/';
  rootBadge.addEventListener('click', () => {
    loadDirectoryContents('/');
  });
  breadcrumbsContainer.appendChild(rootBadge);

  // Create badges for each segment
  let currentPath = '/';
  segments.forEach((segment, index) => {
    // Build accumulated path correctly for this segment
    const segmentPath = currentPath + segment;

    const separator = document.createElement('span');
    separator.className = 'text-gray-500 mx-1';
    separator.textContent = '>';
    breadcrumbsContainer.appendChild(separator);

    const badge = document.createElement('span');
    badge.className = 'bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-gray-300';
    badge.textContent = segment;
    badge.dataset.path = segmentPath;
    badge.addEventListener('click', () => {
      loadDirectoryContents(segmentPath);
    });
    breadcrumbsContainer.appendChild(badge);

    // Update currentPath for next iteration - add trailing slash only if not the last segment
    if (index < segments.length - 1) {
      currentPath = segmentPath + '/';
    }
  });
}

// Function to load drives
async function loadDrives() {
  try {
    const drives = await ipcRenderer.invoke('get-drives');

    // Clear existing navigation menu items
    navMenuContainer.innerHTML = '';

    drives.forEach(drive => {
      const navItem = document.createElement('button');
      navItem.className = 'w-full flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 nav-item';
      navItem.dataset.path = drive;

      // Add folder icon
      const icon = document.createElement('svg');
      icon.className = 'w-5 h-5 mr-3 text-blue-500';
      icon.setAttribute('fill', 'currentColor');
      icon.setAttribute('viewBox', '0 0 20 20');
      icon.innerHTML = '<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />';

      const label = document.createElement('span');
      label.textContent = drive;

      navItem.appendChild(icon);
      navItem.appendChild(label);

      navItem.addEventListener('click', () => {
        currentPath = drive;
        loadDirectoryContents(currentPath);
        createPathBreadcrumbs(currentPath); // Update breadcrumbs
      });

      navMenuContainer.appendChild(navItem);
    });
  } catch (error) {
    console.error('Error loading drives:', error);
  }
}

// Function to get file extension
function getFileExtension(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

// Function to get appropriate icon based on file type
function getFileIcon(item) {
  const iconSpan = document.createElement('span');
  iconSpan.className = 'w-5 h-5 mr-2 flex-shrink-0 flex items-center justify-center text-xs font-bold';

  if (item.isDirectory) {
    // Folder icon (using text representation)
    iconSpan.classList.add('text-blue-500');
    iconSpan.textContent = '📁';
    return iconSpan;
  }

  const ext = getFileExtension(item.name);

  // Define file type icons using text representations
  const fileIcons = {
    // Images
    'jpg': { class: 'text-green-500', char: '🖼️' },
    'jpeg': { class: 'text-green-500', char: '🖼️' },
    'png': { class: 'text-green-500', char: '🖼️' },
    'gif': { class: 'text-green-500', char: '🖼️' },
    'webp': { class: 'text-green-500', char: '🖼️' },
    'svg': { class: 'text-green-500', char: '🖼️' },
    'bmp': { class: 'text-green-500', char: '🖼️' },

    // Documents
    'pdf': { class: 'text-red-500', char: '📄' },
    'doc': { class: 'text-blue-600', char: '📝' },
    'docx': { class: 'text-blue-600', char: '📝' },
    'txt': { class: 'text-gray-500', char: '📝' },
    'rtf': { class: 'text-blue-600', char: '📝' },
    'odt': { class: 'text-blue-600', char: '📝' },

    // Spreadsheets
    'xls': { class: 'text-green-600', char: '📊' },
    'xlsx': { class: 'text-green-600', char: '📊' },
    'csv': { class: 'text-green-600', char: '📊' },
    'ods': { class: 'text-green-600', char: '📊' },

    // Presentations
    'ppt': { class: 'text-orange-500', char: '📽️' },
    'pptx': { class: 'text-orange-500', char: '📽️' },
    'odp': { class: 'text-orange-500', char: '📽️' },

    // Code files
    'js': { class: 'text-yellow-500', char: '📜' },
    'ts': { class: 'text-blue-500', char: '📜' },
    'jsx': { class: 'text-blue-400', char: '📜' },
    'tsx': { class: 'text-blue-400', char: '📜' },
    'py': { class: 'text-yellow-600', char: '🐍' },
    'java': { class: 'text-red-600', char: '☕' },
    'cpp': { class: 'text-blue-700', char: '📜' },
    'c': { class: 'text-blue-700', char: '📜' },
    'html': { class: 'text-orange-500', char: '🌐' },
    'css': { class: 'text-blue-500', char: '🎨' },
    'json': { class: 'text-gray-700', char: '📋' },
    'xml': { class: 'text-purple-500', char: '📋' },
    'php': { class: 'text-purple-600', char: '🐘' },

    // Archives
    'zip': { class: 'text-yellow-600', char: '🗜️' },
    'rar': { class: 'text-yellow-600', char: '🗜️' },
    'tar': { class: 'text-yellow-600', char: '🗜️' },
    'gz': { class: 'text-yellow-600', char: '🗜️' },
    '7z': { class: 'text-yellow-600', char: '🗜️' },

    // Audio files
    'mp3': { class: 'text-pink-500', char: '🎵' },
    'wav': { class: 'text-pink-500', char: '🎵' },
    'flac': { class: 'text-pink-500', char: '🎵' },
    'm4a': { class: 'text-pink-500', char: '🎵' },

    // Video files
    'mp4': { class: 'text-purple-500', char: '🎬' },
    'avi': { class: 'text-purple-500', char: '🎬' },
    'mkv': { class: 'text-purple-500', char: '🎬' },
    'mov': { class: 'text-purple-500', char: '🎬' },
    'wmv': { class: 'text-purple-500', char: '🎬' },

    // Executables
    'exe': { class: 'text-red-600', char: '⚙️' },
    'app': { class: 'text-red-600', char: '⚙️' },
    'sh': { class: 'text-green-600', char: '⚙️' },

    // Default file icon
    'default': { class: 'text-gray-500', char: '📄' }
  };

  // Get icon data based on file extension
  const iconData = fileIcons[ext] || fileIcons.default;
  iconSpan.classList.add(...iconData.class.split(' '));
  iconSpan.textContent = iconData.char;

  return iconSpan;
}

// Function to update navigation menu with directory items and bookmarks
async function updateNavigationMenu(path) {
  try {
    const items = await ipcRenderer.invoke('get-directory-contents', path);

    // Filter to only directories for the navigation menu
    const directories = items.filter(item => item.isDirectory);

    // Clear existing navigation menu items except the header
    navMenuContainer.innerHTML = '';

    // Add "Current Location" header
    const locationHeader = document.createElement('div');
    locationHeader.className = 'px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider';
    locationHeader.textContent = 'Current Location';
    navMenuContainer.appendChild(locationHeader);

    // Add parent directory button (if not root)
    if (path !== '/' && path !== '' && path !== path.sep) {
      let parentDir = '';
      if (os.platform() === 'win32') {
        // Handle Windows paths
        if (path.includes('\\')) {
          const pathParts = path.split('\\').filter(part => part !== '');
          pathParts.pop();
          parentDir = pathParts.length > 0 ? pathParts.join('\\') : path.sep;
        } else {
          const pathParts = path.split('/').filter(part => part !== '');
          pathParts.pop();
          parentDir = pathParts.length > 0 ? pathParts.join('/') : path.sep;
        }
      } else {
        // Handle Unix-like paths
        const pathParts = path.split('/').filter(part => part !== '');
        pathParts.pop();
        parentDir = pathParts.length > 0 ? '/' + pathParts.join('/') : '/';
      }
      const parentButton = document.createElement('button');
      parentButton.className = 'w-full flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 nav-item';
      parentButton.dataset.path = parentDir;

      const icon = document.createElement('svg');
      icon.className = 'w-5 h-5 mr-3 text-gray-500';
      icon.setAttribute('fill', 'currentColor');
      icon.setAttribute('viewBox', '0 0 20 20');
      icon.innerHTML = '<path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />';

      const label = document.createElement('span');
      label.textContent = '.. (Parent)';

      parentButton.appendChild(icon);
      parentButton.appendChild(label);

      parentButton.addEventListener('click', () => {
        loadDirectoryContents(parentDir);
      });

      navMenuContainer.appendChild(parentButton);
    }

    // Add directory items
    directories.forEach(item => {
      const navItem = document.createElement('button');
      navItem.className = 'w-full flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 nav-item';
      navItem.dataset.path = item.path;

      // Add folder icon
      const icon = document.createElement('svg');
      icon.className = 'w-5 h-5 mr-3 text-blue-500';
      icon.setAttribute('fill', 'currentColor');
      icon.setAttribute('viewBox', '0 0 20 20');
      icon.innerHTML = '<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />';

      const label = document.createElement('span');
      label.textContent = item.name;

      navItem.appendChild(icon);
      navItem.appendChild(label);

      navItem.addEventListener('click', () => {
        loadDirectoryContents(item.path);
      });

      navMenuContainer.appendChild(navItem);
    });

    // Add bookmarks section header
    const bookmarksHeader = document.createElement('div');
    bookmarksHeader.className = 'px-2 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider';
    bookmarksHeader.textContent = 'Bookmarks';
    navMenuContainer.appendChild(bookmarksHeader);

    // Add bookmark buttons
    const homeBookmark = document.createElement('button');
    homeBookmark.className = 'w-full flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 nav-item';
    homeBookmark.dataset.path = os.homedir ? os.homedir() : '/';

    const homeIcon = document.createElement('svg');
    homeIcon.className = 'w-5 h-5 mr-3 text-indigo-500';
    homeIcon.setAttribute('fill', 'currentColor');
    homeIcon.setAttribute('viewBox', '0 0 20 20');
    homeIcon.innerHTML = '<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />';

    const homeLabel = document.createElement('span');
    homeLabel.textContent = 'Home';

    homeBookmark.appendChild(homeIcon);
    homeBookmark.appendChild(homeLabel);

    homeBookmark.addEventListener('click', () => {
      const homePath = os.homedir ? os.homedir() : '/';
      loadDirectoryContents(homePath);
    });

    navMenuContainer.appendChild(homeBookmark);

    // Add Desktop bookmark if it exists
    const desktopPath = path.join(os.homedir ? os.homedir() : path.sep, 'Desktop');
    try {
      const fs = require('fs');
      if (fs.existsSync(desktopPath)) {
        const desktopBookmark = document.createElement('button');
        desktopBookmark.className = 'w-full flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 nav-item';
        desktopBookmark.dataset.path = desktopPath;

        const desktopIcon = document.createElement('svg');
        desktopIcon.className = 'w-5 h-5 mr-3 text-green-500';
        desktopIcon.setAttribute('fill', 'currentColor');
        desktopIcon.setAttribute('viewBox', '0 0 20 20');
        desktopIcon.innerHTML = '<path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />';

        const desktopLabel = document.createElement('span');
        desktopLabel.textContent = 'Desktop';

        desktopBookmark.appendChild(desktopIcon);
        desktopBookmark.appendChild(desktopLabel);

        desktopBookmark.addEventListener('click', () => {
          loadDirectoryContents(desktopPath);
        });

        navMenuContainer.appendChild(desktopBookmark);
      }
    } catch (error) {
      // If there's an issue checking Desktop existence, just skip adding it
      console.warn('Could not check Desktop directory existence:', error.message);
    }

  } catch (error) {
    console.error('Error updating navigation menu:', error);
  }
}

// Function to load directory contents
async function loadDirectoryContents(path) {
  try {
    currentPath = path;
    createPathBreadcrumbs(path); // Update breadcrumbs with new path

    // Update the navigation menu to show current directory contents
    updateNavigationMenu(path);

    const items = await ipcRenderer.invoke('get-directory-contents', path);

    // Clear existing contents
    directoryContents.innerHTML = '';

    if (items.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'text-center text-gray-500 py-10';
      emptyMessage.textContent = 'This directory is empty';
      directoryContents.appendChild(emptyMessage);
      return;
    }

    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer directory-item';
      itemElement.dataset.path = item.path;

      // Add appropriate icon based on file type
      const icon = getFileIcon(item);

      const label = document.createElement('span');
      label.className = 'truncate';
      label.textContent = item.name;

      itemElement.appendChild(icon);
      itemElement.appendChild(label);

      if (item.isDirectory) {
        itemElement.addEventListener('click', () => {
          loadDirectoryContents(item.path);
        });
      } else {
        // For files, we could add functionality to open them if needed
        itemElement.addEventListener('click', (e) => {
          e.stopPropagation();
          alert(`File clicked: ${item.name}\nPath: ${item.path}`);
        });
      }

      directoryContents.appendChild(itemElement);
    });
  } catch (error) {
    console.error('Error loading directory contents:', error);
    directoryContents.innerHTML = `<div class="text-center text-red-500 py-10">Error loading directory: ${error.message}</div>`;
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set initial directory contents to root and update navigation menu
  loadDirectoryContents(currentPath);
  createPathBreadcrumbs(currentPath);
});

// Add navigation functionality (to go back to parent directory)
function goBack() {
  if (currentPath === '/' || currentPath === '') {
    return; // Already at root
  }

  // Remove the last part of the path to go up one level
  const pathParts = currentPath.split('/').filter(part => part !== '');
  pathParts.pop(); // Remove last part

  if (pathParts.length === 0) {
    currentPath = '/';
  } else {
    currentPath = '/' + pathParts.join('/');
  }

  loadDirectoryContents(currentPath);
  createPathBreadcrumbs(currentPath); // Update breadcrumbs after navigation
}