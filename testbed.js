jQuery.prototype.loadJS = function(url) {
	this.append('<script type="text/javascript" src="' + url + '"></script>')
}

function loadApp(appJson, userJson) {
	window.frames['app'].location = 'apps/' + appJson.id + '/index.html';
	
	// change this so that it waits for Musubi to load in frame instead of 1000ms
	setTimeout(function() {
		app.Musubi._launchApp(appJson, userJson)
	}, 1000);
}

$(document).ready(function() {
	
	var keyPair = new RSAKeyPair('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqEnUVom64ZzTupLcrBllqZnKlkMxV+nH9Mg78Jqo2OG5Xv7fq0RQIh3Nuis4Wq1zFIG+CNbRjB76zRKP1Dr635N9GTjiTFmnDwTKDwfotwpuJTNaZmowh92xNR+pFYtoCPZQ3ZlUd/qGYPLI4RsQZOXq3SpRdc0kMxpKUEtUCqwIDAQAB','MIICXQIBAAKBgQCqEnUVom64ZzTupLcrBllqZnKlkMxV+nH9Mg78Jqo2OG5Xv7fq0RQIh3Nuis4Wq1zFIG+CNbRjB76zRKP1Dr635N9GTjiTFmnDwTKDwfotwpuJTNaZmowh92xNR+pFYtoCPZQ3ZlUd/qGYPLI4RsQZOXq3SpRdc0kMxpKUEtUCqwIDAQABAoGAKJjXUh7AB0y7meu/vYl6dqeV3me+Hxf1ddcpNI+WOfMmg9PD902JVq/eohiIMWkeb//aHl7rfGgw4WIVMT4f0Co3ju5KxuJnJtE4WA/Iut6/iR4UATX2Z8O8OfcioUtW+F7IEE64/9d0wW7wn177vsqUbC6Q3o8Ay+ljTNRFDAECQQDR+eCbBJSLq9374Iszz/Ru4xhIcM76RDdH3RrgmeC37F8xBuC5mn0yiiUDqZIjLwOTed/PjjzoCAp16L1SewiBAkEAz1l/hmcpdkk7+IVVThH2LWOctzTGu2LbRLwSeKZ2HMCsUK9kDDVh4txUEg23fcu2LMp3vAFD07mINAGlJHgVKwJBAK2jGDS49eoGZxxqFFL1TeoAy8zj1JUqohhAZICFX0pZImLVkDKL6apIiNFdgaassyVabFUkB4PNWnEk1KKHcYECQCAbV6fUKZNrW6Hr432nQltc5VNpFKzHbfSCusl73SYun4AO6IsLaRDb1RjGjvcnqBnfcBLojzwlqnWDG7M99OkCQQDJozXppqMj5HqCEGUOHGGxHigHAHCCC15vR2e9k84goUNbf9E7ICyII+ms2zpk0rIj+VtCvGWmC7WXUaowu62P');
	
	//var keyPair = new RSAKeyPair('010001','2898d7521ec0074cbb99ebbfbd897a76a795de67be1f17f575d729348f9639f32683d3c3f74d8956afdea2188831691e6fffda1e5eeb7c6830e16215313e1fd02a378eee4ac6e26726d138580fc8badebf891e140135f667c3bc39f722a14b56f85ec8104eb8ffd774c16ef09f5efbbeca946c2e90de8f00cbe9634cd4450c01','aa127515a26eb86734eea4b72b06596a6672a590cc55fa71fd320efc26aa36386e57bfb7ead1140887736e8ace16ab5cc5206f8235b46307beb344a3f50ebeb7e4df464e38931669c3c13283c1fa2dc29b894cd6999a8c21f76c4d47ea4562da023d943766551dfea1983cb23846c419397ab74a945d73490cc6929412d502ab');
	Musubi.platform.init(keyPair);
	Musubi.platform._transport.onMessage(function(msg) {
		console.log(msg);
		//var user = {name: "Test", id: keyPair.publicKeyString};
		//var app = {id: 'edu.stanford.mobisocial.games.wordplay', feed: {name: "Test", uri: "", session: "", key: ""}, message: msg};
		//loadApp(app, user);
	});
	
	//var app = {id: 'edu.stanford.mobisocial.games.wordplay', feed: {name: "Test", uri: "", session: "", key: ""}, message: {obj: {}}};
	
	
});