export default {
	mapVisibleData() {
		return tableHeritage.filteredTableData.map(item => ({
			title: item.Nome,
			lat: item.Latitude,
			long: item.Longitude,
			id: item.Item,
		}));
	},

	getRowIndexFromMarkerTitle(markerTitle) {
		// 1. Find marker object from the markers array using title
		const markerObject = mapHeritage.markers.find(marker => marker.title === markerTitle);

		if (!markerObject) {
			showAlert("Marker not found in markers list.", "error");
			return -1;  // Return -1 when not found
		}

		// 2. Extract the ID from the marker
		const heritageId = markerObject.id;

		// 3. Find the index of the row in the filtered table data
		const rowIndex = tableHeritage.filteredTableData.findIndex(row => row.Item === heritageId);

		if (rowIndex === -1) {
			showAlert("Matching heritage not found in current table view.", "warning");
		}

		return rowIndex;
	},

	getImageFileIdByHeritageId(heritageId) {
		// Early exit for invalid heritageId
		if (!heritageId && heritageId !== 0) {
			console.log("Invalid heritageId:", heritageId);
			return null;
		}

		// Build the target image name based on heritage ID
		const targetImageName = `${heritageId}.jpg`;

		// Search inside your fetched image records (assuming they are stored from your API call)
		getHeritageImages.run();

		// Create regex pattern: matches filenames like "19.jpg", "19.jpeg", "19.png", etc.
		const pattern = new RegExp(`^${heritageId}\\.(jpg|jpeg|png)$`, 'i');
		const imageRecord = getHeritageImages.data.records.find(file => pattern.test(file.name));


		if (imageRecord) {
			return imageRecord.id;
		} else {
			showAlert(`Image for heritage ID ${heritageId} not found.`, "warning");
			return null;
		}
	},

	async onRowClick() {
		const rowId = tableHeritage.selectedRow.Item;

		storeValue("selectedHeritageId", rowId);

		try {
			await getHeritageDetailsById.run();
			await getCommentsById.run();
			await this.getImageFileIdByHeritageId(rowId);
			await showModal('modalHeritageDetails');
		} catch (error) {
			showAlert('Failed to load heritage details.', 'error');
		}
	},

	async onMapMarkerClick() {
		const markerTitle = mapHeritage.selectedMarker.title;

		// 1. Get the row index corresponding to the marker
		const targetIndex = this.getRowIndexFromMarkerTitle(markerTitle);

		// 2. If found, select the row in the table (this will trigger onRowSelected automatically)
		if (targetIndex >= 0) {
			tableHeritage.setSelectedRowIndex(targetIndex);
			this.onRowClick();
		}
	},	
}
