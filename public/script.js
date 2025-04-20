document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const msg = document.getElementById('message');
  if (res.ok) {
    msg.textContent = "File uploaded successful✅!";
    loadFiles();
    e.target.reset();
  } else {
    msg.textContent = "File uploaded failed❌!";
  }
});

function loadFiles() {
  fetch('/files')
    .then(res => res.json())
    .then(files => {
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';

      if (files.length === 0) {
        fileList.textContent = "No uploaded files";
        return;
      }

      files.forEach(file => {
        const container = document.createElement('div');
        container.className = 'file-entry';

        const link = document.createElement('a');
        link.href = file.url;
        link.textContent = file.name;
        link.target = '_blank';
        link.className = 'file-item';

        const delButton = document.createElement('button');
        delButton.textContent = '❌';
        delButton.className = 'delete-btn';
        delButton.onclick = () => deleteFile(file.name);

        container.appendChild(link);
        container.appendChild(delButton);
        fileList.appendChild(container);
      });
    });
}

function deleteFile(filename) {
  fetch('/delete/' + encodeURIComponent(filename), { method: 'DELETE' })
    .then(res => {
      if (res.ok) {
        document.getElementById('message').textContent = 'File has been deleted';
        loadFiles();
      } else {
        alert('File has not been deleted');
      }
    });
}

document.addEventListener('DOMContentLoaded', loadFiles);
