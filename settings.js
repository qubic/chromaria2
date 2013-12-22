$(document).ready(function() {
	var settings = JSON.parse(localStorage["settings"]);

	load(settings);

	$("#save").click(function() {
		settings.fileExtension = $("#fileExtension").val();
		settings.aria2RPCUri = $("#aria2RPCUri").val();
		settings.notificationEnabled = $("#notificationEnabled").prop("checked");
		updateSettings(settings);
	});

	function load(s){
		$('#aria2RPCUri').val(s.aria2RPCUri);
		$('#fileExtension').val(s.fileExtension);
		if(s.notificationEnabled == "true") {
			$('#notificationEnabled').attr("checked", s.notificationEnabled);
		}
	}

	function updateSettings(s){
		localStorage["settings"] = JSON.stringify(s);
	}
});

