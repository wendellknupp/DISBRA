module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------
	
	name: "Check Member Permissions",
	
	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------
	
	section: "Conditions",
	
	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------
	
	subtitle: function(data) {
		const results = ["Continue Actions", "Stop Action Sequence", "Jump To Action", "Jump Forward Actions"];
		return `If True: ${results[parseInt(data.iftrue)]} ~ If False: ${results[parseInt(data.iffalse)]}`;
	},
	
	//---------------------------------------------------------------------
	// Action Fields
	//
	// These are the fields for the action. These fields are customized
	// by creating elements with corresponding IDs in the HTML. These
	// are also the names of the fields stored in the action's JSON data.
	//---------------------------------------------------------------------
	
	fields: ["member", "varName", "permission", "iftrue", "iftrueVal", "iffalse", "iffalseVal", "checkInChannel", "channel", "varName2"],
	
	//---------------------------------------------------------------------
	// Command HTML
	//
	// This function returns a string containing the HTML used for
	// editting actions. 
	//
	// The "isEvent" parameter will be true if this action is being used
	// for an event. Due to their nature, events lack certain information, 
	// so edit the HTML to reflect this.
	//
	// The "data" parameter stores constants for select elements to use. 
	// Each is an array: index 0 for commands, index 1 for events.
	// The names are: sendTargets, members, roles, channels, 
	//                messages, servers, variables
	//---------------------------------------------------------------------
	
	html: function(isEvent, data) {
		return `
	<div style="width: 550px; height: 350px; overflow-y: scroll">
		<div style="float: left; width: 35%;">
			Source Member:<br>
			<select id="member" class="round" onchange="glob.memberChange(this, 'varNameContainer')">
				${data.members[isEvent ? 1 : 0]}
			</select>
		</div>
		<div id="varNameContainer" style="display: none; float: right; width: 60%;">
			Variable Name:<br>
			<input id="varName" class="round" type="text" list="variableList"><br>
		</div><br><br><br>
		<div style="padding-top: 8px; width: 80%;">
			Permission:<br>
			<select id="permission" class="round">
				${data.permissions[2]}
			</select>
		</div><br>
		<div style="padding-top: -4px; width: 35%">
			Check In Channel?<br>
			<select id="checkInChannel" class="round" onchange="glob.onChangeCheckInChannel(this)">
				<option value="0" selected>No</option>
				<option value="1">Yes</option>
			</select>
		</div><br>
		<div id="channelToCheckContainer" style="display: none; float: left; padding-top: -4px; width: 35%">
			Channel To Check:<br>
			<select id="channel" class="round" onchange="glob.channelChange(this, 'varNameContainer2')">
				${data.channels[isEvent ? 1 : 0]}
			<select>
		</div>
		<div id="varNameContainer2" style="display: none; float: right; padding-top: -4px; width: 60%">
			Variable Name:<br>
			<input id="varName2" type="text" class="round" list="variableList">
		</div><span id="spanBr"><br><br><br></span>
		<div id="conditions">
			${data.conditions[0]}
		</div>
	</div>
		`
	},
	
	//---------------------------------------------------------------------
	// Action Editor Init Code
	//
	// When the HTML is first applied to the action editor, this code
	// is also run. This helps add modifications or setup reactionary
	// functions for the DOM elements.
	//---------------------------------------------------------------------
	
	init: function() {
		const {glob, document} = this;

		glob.onChangeCheckInChannel = function(checkInChannel) {
			switch(parseInt(checkInChannel.value)) {
				case 0:
					document.getElementById("channelToCheckContainer").style.display = "none";
					document.getElementById("varNameContainer2").style.display = "none";
					document.getElementById("spanBr").innerHTML = "";
					document.getElementById("conditions").setAttribute("style", "padding-top: 0");
					break;
				case 1:
					document.getElementById("channelToCheckContainer").style.display = null;
					parseInt(document.getElementById("channel").value) === 3 || 4 || 5 ? document.getElementById("varNameContainer2").style.display = null : document.getElementById("varNameContainer2").style.display = "none";
					document.getElementById("spanBr").innerHTML = "<br><br><br>";
					document.getElementById("conditions").setAttribute("style", "padding-top: 8px");
					break;
				}
			}

			glob.memberChange(document.getElementById('member'), 'varNameContainer');
			glob.onChangeCheckInChannel(document.getElementById('checkInChannel'));

			if (parseInt(document.getElementById("checkInChannel").value) !== 0) {
				glob.channelChange(document.getElementById('channel'), 'varNameContainer2');
			}

			glob.onChangeTrue(document.getElementById('iftrue'));
			glob.onChangeFalse(document.getElementById('iffalse'));
	},
	
	//---------------------------------------------------------------------
	// Action Bot Function
	//
	// This is the function for the action within the Bot's Action class.
	// Keep in mind event calls won't have access to the "msg" parameter, 
	// so be sure to provide checks for variable existance.
	//---------------------------------------------------------------------
	
	action: function(cache) {
		const data = cache.actions[cache.index];
		const type = parseInt(data.member);
		const varName = this.evalMessage(data.varName, cache);
		const member = this.getMember(type, varName, cache);
		const cType = parseInt(data.channel);
		const varName2 = this.evalMessage(data.varName2, cache);
		const channel = this.getChannel(cType, varName2, cache)
		const checkInChannel = parseInt(data.checkInChannel);
		let result = false;
		if(member) {
			if (checkInChannel === 1) {
				if (channel.permissionsFor(member).has([data.permission]) === true) {
					if (member.permissions.has([data.permission]) === true) {
						result = true;
					}
				}
			} else {
				result = member.permissions.has([data.permission]);
			}
		}
		this.executeResults(result, data, cache);
	},
	
	//---------------------------------------------------------------------
	// Action Bot Mod
	//
	// Upon initialization of the bot, this code is run. Using the bot's
	// DBM namespace, one can add/modify existing functions if necessary.
	// In order to reduce conflictions between mods, be sure to alias
	// functions you wish to overwrite.
	//---------------------------------------------------------------------
	
	mod: function(DBM) {
	}
	
	}; // End of module