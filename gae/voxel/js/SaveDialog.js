function SaveDialog(editor) {
	this.editor = editor;

	$('#saveDialog #save').bind('click', $.proxy(this.upload, this));
	$('#saveDialog #cancel').bind('click', $.proxy(this.close, this));
}

SaveDialog.prototype = {
	show: function (data) {
		$('#saveDialogContainer').removeClass('hidden');
		$('#saveBlocker').removeClass('hidden');

		this.data = data;

		$('#saveDialog #name').val(this.data.drawing_name);
		$('#saveDialog #author').val(this.data.drawing_author);

		$('#saveDialog img').attr('src', this.data.drawing_image);

		$('#saveDialog #overwrite')[0].checked = false;


		if (this.data.drawing_id != undefined) {
			$('#saveDialog #overwriteDiv').removeClass('hidden');
			$('#saveDialog #overwrite')[0].checked = true;
		}
		else {
			$('#saveDialog #overwriteDiv').addClass('hidden');
		}
	},

	close: function () {
		$('#saveDialogContainer').addClass('hidden');
		$('#saveBlocker').addClass('hidden');

		delete this.data;
	},

	upload: function () {
		this.data.drawing_name = $('#saveDialog #name').val();
		this.data.drawing_author = $('#saveDialog #author').val();

		this.overwrite = $('#saveDialog #overwrite')[0].checked;
		if (!this.overwrite) {
			delete this.data.drawing_id;
		}

		//$.post("./save.php", this.data, $.proxy(this.uploaded, this));
		$.post('Voxel/save', this.data, $.proxy(this.uploaded, this));

		this.close();
	},

	uploaded: function (data) {
		if (data.length > 0) {
			//alert(data);

			if (!this.overwrite) {
				this.editor.currentDrawing.drawing_id = data;
				_gaq.push(['_trackEvent', 'document', 'save', 'id:' + data]);
			}
			else
				_gaq.push(['_trackEvent', 'document', 'save', 'update']);
		}
	}
}