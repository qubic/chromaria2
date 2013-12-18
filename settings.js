$(document).ready(function() {
	init();

	$("#save").click(function() {
		localStorage["subfix"] = $("#subfix").val();
		localStorage["path"] = $("#path").val();
	});

	function init(){
		var path = localStorage["path"];
		var subfix = localStorage["subfix"];
		$('#path').val(path);
		$('#subfix').val(subfix);
	}
});

