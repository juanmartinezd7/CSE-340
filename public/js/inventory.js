//public/js/inventory.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const classificationList = document.getElementById('classificationList');
  const inventoryDisplay = document.getElementById('inventoryDisplay');
  if (!classificationList || !inventoryDisplay) return;

  classificationList.addEventListener('change', () => {
    const id = classificationList.value;
    // If placeholder selected, clear the table and stop
    if (!id) {
      inventoryDisplay.innerHTML = '';
      return;
    }

    const url = `/inv/getInventory/${id}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Network response was not OK');
        return r.json();
      })
      .then((data) => {
        // Build table
        let html = '<thead><tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr></thead><tbody>';
        data.forEach((v) => {
          html += `
            <tr>
              <td>${v.inv_make} ${v.inv_model}</td>
              <td><a href="/inv/edit/${v.inv_id}" title="Click to update">Modify</a></td>
              <td><a href="/inv/delete/${v.inv_id}" title="Click to delete">Delete</a></td>
            </tr>`;
        });
        html += '</tbody>';
        inventoryDisplay.innerHTML = html;
      })
      .catch((err) => {
        console.error('There was a problem: ', err.message);
        inventoryDisplay.innerHTML = '<tbody><tr><td colspan="3">Unable to load inventory.</td></tr></tbody>';
      });
  });
});
