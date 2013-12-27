$(document).ready(function() {
	var settings = getSettings();

	load(settings);

	$("#save").click(function() {
		settings.fileExtension = $("#fileExtension").val();
		settings.aria2RPCUri = $("#aria2RPCUri").val();
		settings.notificationEnabled = $("#notificationEnabled").prop("checked");
		settings.extensionEnabled = $("#extensionEnabled").prop("checked");
		updateSettings(settings);
	});

	function load(s){
		$('#aria2RPCUri').val(s.aria2RPCUri);
		$('#fileExtension').val(s.fileExtension);
		if(s.notificationEnabled == true) {
			$('#notificationEnabled').attr("checked", s.notificationEnabled);
		}
		if(s.extensionEnabled) {
			$('#extensionEnabled').attr("checked", s.extensionEnabled);
		}
	}
	function getSettings(){
		var s = localStorage["settings"];
		return s == undefined ? s : JSON.parse(s);
	}
	function updateSettings(s){
		localStorage["settings"] = JSON.stringify(s);
	}
});

