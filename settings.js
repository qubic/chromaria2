$(document).ready(function() {
	var settings = getSettings();

	load(settings);

	$("#save").click(function() {
		settings.fileExtension = $("#fileExtension").val();
		settings.aria2RPCUri = $("#aria2RPCUri").val();
		updateSettings(settings);
	});

	function load(s){
		$('#aria2RPCUri').val(s.aria2RPCUri);
		$('#fileExtension').val(s.fileExtension);
	}
	function getSettings(){
		var s = localStorage["settings"];
		return s == undefined ? s : JSON.parse(s);
	}
	function updateSettings(s){
		localStorage["settings"] = JSON.stringify(s);
	}
});

