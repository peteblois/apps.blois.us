function DrawingBrowser(editor) {
	this.editor = editor;
}

DrawingBrowser.prototype = {
	show: function () {
		$('#drawings').removeClass('drawingsCollapsed');
		$('#browseButton').attr('value', 'edit');

		var script = document.createElement('script');
		script.type = 'text/javascript';

		window['handleBrowseData'] = $.proxy(this.handleBrowseData, this);
		//script.src = 'http://binfab.com/Voxel/get.php?callback=handleBrowseData';
		script.src = 'Voxel/get?callback=handleBrowseData';

		$("body").append(script);

		_gaq.push(['_trackEvent', 'document', 'browse']);
	},

	hide: function () {
		$('#drawings').addClass('drawingsCollapsed');
		$('#browseButton').attr('value', 'browse');
		$('#drawings').empty();
	},

	handleBrowseData: function (data) {
		var items = $('#drawingTemplate').tmpl(data);
		var browser = this;
		items.bind('click', function () {
			browser.open($(this).data().tmplItem.data.drawing_id);
		});
		items.appendTo('#drawings');

	},

	open: function (id) {
		var voxelEditor = this;

		var script = document.createElement('script');
		script.type = 'text/javascript';

		window['handleOpenData'] = $.proxy(this.handleOpenData, this);
		//script.src = 'http://binfab.com/Voxel/get.php?drawing_id=' + id + '&callback=handleOpenData';
		script.src = 'Voxel/get?id=' + id + '&callback=handleOpenData';

		_gaq.push(['_trackEvent', 'document', 'open', 'id:' + id]);

		$("body").append(script);

	},

	handleOpenData: function (data) {
		

		this.editor.load(data[0]);
		this.editor.editMode();
	}
}