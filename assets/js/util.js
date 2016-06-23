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

/*
 * getURL
 */
import 'whatwg-fetch';
export function getURL(url) {
	return new Promise((resolve, reject) => {
		return(
			fetch(url).
			then(res => {
				if (res.status == 200) {
					return res.json();
				} else {
					return resolve({status: res.status, value: url});
				}
			}).
			then(json => resolve({status: 200, value: json})).
			catch(err => reject(err))
		);
	});
}

/*
 * loop with interval and retry limit
 *   default interval in 500ms
 *   default retry 10 times
 */
export function loop(promise, fn, interval = 500, retry = 10) {
	if (--retry < 0) {
		return Promise.reject('retry over');
	}

	return promise.then(fn).then(result => {
		if (result.status == 200) {
			return result.value;
		} else {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					return resolve(loop(Promise.resolve(result.value), fn, interval, retry));
				}, interval);
			});
		}
	});
}

