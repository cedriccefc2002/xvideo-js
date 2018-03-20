let request = require('request');
let cheerio = require('cheerio');
let host = "https://www.xvideos.com";
var URL = require('url');
let readline = require('readline')

/*
Keyword(homepage) -> Page(loop?) -> URI -> request(async)
-> body -> "video_list"(append?)
*/

function homepageUrl(page){
	if(page===0) return host;
	return host+URL.format({
				path:'/new/'+page,
				json:true
			});
}

function keywordUrl(keyword,page){
	return host+URL.format({
				query:{
					k:keyword,
					p:page
				},
				json:true
			});
}

function req(url){
	return new Promise(function(resolve,reject){
		request(
		{
			method:'GET',
			header:{'Content-Type' : 'application/json; charset=UTF-8'},
			uri:url
		},(err,res,body)=>{
			    if(!err){
			    	try{
			    		resolve(body);
			    	}catch(err){
			    		reject(Error('no content'));
			    	}	    	
			    }else{
			    	reject('No response');
			    }
			})
		})
}

function parseVideo(body,page){
	let $ = cheerio.load(body);
	let content = $('#content');
	let avArray = [];
	let video = content.find('.thumb-block')
	if(video[0]===undefined) throw new Error('no content')
	for(let i=0;i<video.length;i++){
		let obj = {
			page:page,
			attr:{
				index:i,
				name:video.eq(i).children('p').eq(0).text(),
				link:video.eq(i).children('p').eq(0).children('a').attr('href')
			}
		}
		avArray.push(obj);
	}
	return avArray;
}

async function homepageCrawler(page){
	let body = await req(homepageUrl(page));
	let avlist = parseVideo(body,page);
	console.log(avlist);
}

async function keywordCrawler(keyword,page){
	let body = await req(keywordUrl(keyword,page));
	let avlist = parseVideo(body,page);
	console.log(avlist);
}

//keywordCrawler('keyword',0);
//homepageCrawler(0);
exports.hpc = homepageCrawler;
exports.kwc = keywordCrawler;