// Script by Zack C 1/27/2022
//  Cycles through pitching types. Mainly useful for YTPMV
//  Does not modify events using classic pitching
//
// Use:
//   1. Place into C:/Program Files/VEGAS/VEGAS Pro 1X.0/Script Menu
//   2. In Vegas, Tools > Scripting > Rescan Script Menu
//   3. Bind script to a hotkey. Options > Customize Keyboard >
//       > Show commands containing: type "bulk update pitching mode" >
//       > press hotkeys > Click "Add" > Click "OK"
//   4. In Vegas, press Control + Shift + I to show titles and pitch changes in timeline
//   5. Select all events to be updated and press hotkey. Pitching mode should appear in event title
//
// Highly recommended:
//  - Bind the script to a hotkey. See step 3 above
//  - Use with Control + Shift + I to easily see pitch mode

import ScriptPortal.Vegas;
import System.IO;
import System.Windows.Forms;

// Change pitching types to cycle through
var pitch_types = [
	{name: "Efficient", val: ElastiqueStretchAttributes.Efficient, formant_lock: false},
	{name: "Pro", val: ElastiqueStretchAttributes.Pro, formant_lock: false},
	{name: "Pro (Preserve Formants)", val: ElastiqueStretchAttributes.Pro, formant_lock: true},
	{name: "Soloist (Monophonic)", val: ElastiqueStretchAttributes.Soloist_Monophonic, formant_lock: false},
	{name: "Soloist (Speech)", val: ElastiqueStretchAttributes.Soloist_Speech, formant_lock: false}
];

var tracks = Vegas.Project.Tracks;
for (var i = 0; i < tracks.Count; i++) {
	var track = tracks[i];
	if (track.IsAudio()) {
		for (var j = 0; j < track.Events.Count; j++) {
			var audio_event = track.Events[j];
			if (audio_event.Selected) {
				change_pitch_type(audio_event);
			}
		}
	}
}

// Cycles through pitching types defined in pitch_types
function change_pitch_type(audio_event) {
	
	try { // Skip over event if it uses classic pitching
		audio_event.ElastiqueAttribute == ""; 
	} catch (ex) {
		if (!audio_event.ActiveTake.Name.Contains("Classic")) {
			audio_event.ActiveTake.Name += " - Classic " + audio_event.ClassicAttribute;
		}
		return;
	}
	
	for (var i = 0; i < pitch_types.length; i++) {
		
		var formant_match = true;
		try { // FormantMatch is undefined on pitch types other than Pro, so it has to be try-catched
			formant_match = (audio_event.FormantLock == pitch_types[i].formant_lock);
		} catch (ex) {
			formant_match = true;
		}
		
		if (audio_event.ElastiqueAttribute == pitch_types[i].val && formant_match) {
			var next_index = i + 1;
			if (next_index == pitch_types.length) {
				next_index = 0; // Loop around to first if at end of list
			}
			var next_pitch = pitch_types[next_index];
			audio_event.ElastiqueAttribute = next_pitch.val;
			try {
				audio_event.FormantLock = next_pitch.formant_lock;
			} catch (ex) {}
			update_name(audio_event, pitch_types[i].name, next_pitch.name);
			return;
		}
	}
}

function update_name(audio_event, old_pitch, new_pitch) {
	var old_name = audio_event.ActiveTake.Name;
	var new_name = old_name.replace(old_pitch, new_pitch)

	if (new_name == old_name) {
		new_name += " - " + new_pitch;
	}
	
	audio_event.ActiveTake.Name = new_name;
}
