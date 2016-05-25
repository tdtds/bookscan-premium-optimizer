/*
 * load recent list
 */
export function loadRecentList(){
	var json = localStorage['recentList'];
	var recents = [];
	if(json){
		recents = JSON.parse(json)
	}
	return recents;
}

/*
 * add the list to recent lists
 */
export function addRecentList(newList){
	var recents = loadRecentList();
	if(!newList){
		return recents;
	}

	var dup = recents.indexOf(newList);
	if(dup != -1){
		recents.splice(dup, 1);
	}
	if(recents.length >= 5){
		recents.splice(4, recents.length - 4);
	}
	recents.splice(0, 0, newList);
	localStorage['recentList'] = JSON.stringify(recents);
	return recents;
}

