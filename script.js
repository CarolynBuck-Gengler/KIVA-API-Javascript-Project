/*  KIVA API	
    Author: Carolyn Buck-Gengler
    Date:   12/02/18

    Filename: script.js 
    script for KIVA API call
	for ref see script.js for chapter_11/chapter
*/

"use strict";

// global variables
var KivaReport;
var httpRequest = false; // keep track of whether existing http request is open

function getRequestObject() {
// few changes for KIVA, just the error message
// returns httpRequest object or false 
	try {
		httpRequest = new XMLHttpRequest();	// instantiate XMLHttpRequest object and assign to httpRequest
	}
	
	catch (requestError) {
		// if error, catch it and display error message
		document.querySelector("p.error").innerHTML = "Error in getting httpRequest; not supported by your browser(?).";
		document.querySelector("p.error").style.display = "block";
		return false;
	}
	// no error, so return httpRequest object
	return httpRequest;
}

function getKiva(evt) {
	if (!httpRequest) { 
		// see if httpRequest already has truthy value, indicating existing request available to use
		// if not,instantiate the  XMLHttpRequest object
		httpRequest = getRequestObject();
	}

	httpRequest.abort(); // Cancel any existing HTTP requests before beginning a new one
	httpRequest.open("get","KIVA.php?", true); // true = asynchronous
	httpRequest.send(null);
	httpRequest.onreadystatechange = fillKiva;
	
	// refresh every n seconds
	clearTimeout(updateKiva);
	var updateKiva = setTimeout('getKiva()', 10000); 
 
		
} // end function getKiva

function fillKiva () {
	if (httpRequest.readyState === 4 && httpRequest.status === 200) {
		// parse the responseText value, assign resulting JSON object to weatherReport
		var TimeNow = new Date();
		var minPhrase;
		KivaReport = JSON.parse(httpRequest.responseText);
		
		// Report some time statistics
		var TimeFirst = new Date(KivaReport.lending_actions[99].date);
		var TimeLast = new Date(KivaReport.lending_actions[0].date);

		var AgeNewest = (TimeNow - TimeLast)/1000;
		var AgeNewestCell = document.getElementById("agenewest");
		var AgeNewestMin = Math.floor(AgeNewest/60);
		minPhrase = (AgeNewestMin === 1) ? " minute" : " minutes";
		var AgeNewestSec = Math.round((AgeNewest%60)*100)/100;
		AgeNewestCell.innerHTML = Math.floor(AgeNewest/60) + minPhrase + ", " + AgeNewestSec + " seconds";
		
		var AgeOldest = (TimeNow - TimeFirst)/1000;
		var AgeOldestCell = document.getElementById("ageoldest");
		var AgeOldestSec = Math.round((AgeOldest%60)*100)/100;
		AgeOldestCell.innerHTML = Math.floor(AgeOldest/60) + " minutes, " + AgeOldestSec + " seconds";

		var AvgTimeDiffCell = document.getElementById("avgtimebetw");
		AvgTimeDiffCell.innerHTML = (Math.round(AgeOldest*1000/100))/1000 + " seconds";
		
		// the 5 most recently funded borrowers
		var rows = document.querySelectorAll("section.borrowers table tbody tr"); 
		for (i = 0;i < 5;i++) {
		
			var TransactionTime = new Date(KivaReport.lending_actions[i].date);
			var BorrowerID = KivaReport.lending_actions[i].loan.id;
			var BorrowerName = KivaReport.lending_actions[i].loan.name;
			var BorrowerCountry = KivaReport.lending_actions[i].loan.location.country;

			var firstCell = rows[i].getElementsByTagName("td")[0]; 
			var secondCell = rows[i].getElementsByTagName("td")[1]; 
			var thirdCell = rows[i].getElementsByTagName("td")[2]; 
			var fourthCell = rows[i].getElementsByTagName("td")[3];

			firstCell.innerHTML = TransactionTime.toLocaleString();
			var linkToBorrower = '<a href=\"https://www.kiva.org/lend/' 
 					+ BorrowerID + '\">' + BorrowerID + "</a>";
//					+ BorrowerID + '\"target=\"_blank\">' + BorrowerID + "</a>";
			secondCell.innerHTML = linkToBorrower;
			thirdCell.innerHTML = BorrowerName;
			fourthCell.innerHTML = BorrowerCountry;
		} // end of for loop -- 5 most recently funded borrowers
		
		/* now run through all 100 and compute various things about them */
		var runningTotalPercentLeft = 0;
		var runningTotalFirstLender = 0;
		var runningTotalFullyFunded = 0;
		var countriesList = {};
		for (i = 0;i <= 99;i++) {
			// compute % left for this borrower
			var PercentFunded 
				= KivaReport.lending_actions[i].loan.funded_amount/KivaReport.lending_actions[i].loan.loan_amount;
			// add that to the running total for later computation of average 
			runningTotalPercentLeft += PercentFunded;
			
			// if the loan status == funded, then it was the last loan to that borrower,
			// and their loan must be fully funded (yay!)
			if (KivaReport.lending_actions[i].loan.status === "funded") {
				runningTotalFullyFunded++;
			}
			
			// if lender_count = 1, it's the first lender/lending action to this loan
			if (KivaReport.lending_actions[i].loan.lender_count === 1) {
				runningTotalFirstLender++;
			}
			// keep a count for each borrower's country
			curCountry = KivaReport.lending_actions[i].loan.location.country;
			if (countriesList[curCountry]) {
				countriesList[curCountry] += 1;
			} else {
				countriesList[curCountry] = 1;
			}
		} // end of for loop cycling through all 100 lending actions
		
		var AvgPercentLeft = (Math.round((runningTotalPercentLeft/100)*1000))/10 + "%";
		var AvgPercentLeftCell = document.getElementById("percentfunded");
		var FullyFundedCell = document.getElementById("fullyfunded");
		var FirstLenderCell = document.getElementById("firstloan");
		AvgPercentLeftCell.innerHTML = AvgPercentLeft;
		FullyFundedCell.innerHTML = runningTotalFullyFunded;
		FirstLenderCell.innerHTML = runningTotalFirstLender;
		
		var largestNumberOfLoans = 0;
		var curCountry;
		var countriesWithMostLoans = "";
		for (curCountry in countriesList) {
			if (countriesList[curCountry] > largestNumberOfLoans) {
				countriesWithMostLoans = curCountry;
				largestNumberOfLoans = countriesList[curCountry];
			} else if (countriesList[curCountry] === largestNumberOfLoans) {
				countriesWithMostLoans += (", " + curCountry);
			}
		}
		var RecMostLoansCell = document.getElementById("recmostloans");
		RecMostLoansCell.innerHTML = countriesWithMostLoans + " (" + largestNumberOfLoans +")";
		
		document.querySelector("section.borrowers table caption").style.display = "block";
		document.querySelector("section.borrowers table").style.display = "inline-block";
		document.getElementById("secondtable").style.display = "inline-block";
		document.getElementById("table2caption").style.display = "block";
	}
	
} // end of function fillKiva

var locations = document.querySelectorAll("section ul li");
for (var i = 0; i < locations.length; i++) {
   if (locations[i].addEventListener) {
      locations[i].addEventListener("click", getKiva, false);
   } else if (locations[i].attachEvent) {
      locations[i].attachEvent("onclick", getKiva);
   }
}
if (window.addEventListener) {
   window.addEventListener("load", getKiva, false);
} else if (window.attachEvent) {
   window.attachEvent("onload", getKiva);
}