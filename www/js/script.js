document.addEventListener("deviceReady", initApp, false);

$(document).ready(function () {
	console.log("jQuery ready");	
});

function initApp() {
	"use strict";

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   VARIABLES
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	var active_report = "";
	var active_question = 1;
	var user = "";
	var email = "";

	var listLength = $(".orderedList li").length,
		i = 0,
		questionsUp = 0,
		viewing = false,
		userCount = 1;

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   LOCAL STORAGE AND REPORT OBJECT
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var Report = {
		name: "After Action Report",
		complete: "no",
		activeQuestion: 0
	};
	
	//Check all keys in local storage and look for a specific value in the value. If found, increment r
	function checkReportCount() {
		var r = 0;
		for (var i = 0; i < localStorage.length; i++) {
			try {
				var obj = JSON.parse(localStorage.getItem(localStorage.key(i)));
				if (obj.name == "After Action Report") {
					r++;
				}
			} catch (e) {
				console.log('Value is not JSON, skipping');
			}
		}
		return r;
	}

	function updateReport() {
		window.localStorage.setItem(active_report, JSON.stringify(Report));
	}

	function saveUserInfo() {
		window.localStorage.setItem("koaa_user", $("#user").val());
		window.localStorage.setItem("koaa_email", $("#email").val());

		user = localStorage.getItem("koaa_user");
		email = localStorage.getItem("koaa_email");

		$("#userNew").val(user);
		$("#emailNew").val(email);
	}
	
	function saveNewUserInfo() {
		window.localStorage.setItem("koaa_user", $("#userNew").val());
		window.localStorage.setItem("koaa_email", $("#emailNew").val());

		user = window.localStorage.getItem("koaa_user");
		email = window.localStorage.getItem("koaa_email");
	}

	function checkUserInfo() {
		if(window.localStorage.getItem("koaa_user") && window.localStorage.getItem("koaa_email")) {

			$(".loginbutton, .introcontain").hide();
			$(".ini").animate({
				top: "50px"
			}, 400);

			$("#welcome, .ini").addClass("hidden");
			$(".initialnext").addClass("hidden");
			$("#list, a.newreview").slideUp().removeClass("hidden");
		
			user = window.localStorage.getItem("koaa_user");
			email = window.localStorage.getItem("koaa_email");

			$("#userNew").val(user);
			$("#emailNew").val(email);

			populateTheList();
			populateListHeader();	
		}
	}

	checkUserInfo();

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   NAVIGATION
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (isiPhone()) {
		$('form').on('focus', 'input, textarea', function() {
			$('footer').css("display", "none");
		});
		$('form').on('blur', 'input, textarea', function() {
			$('footer').css("display", "block");
		});
	}

	$("nav").on("click", "#saveall", function() {
		Report.id = active_report;
		Report.complete = "yes";
		window.localStorage.setItem(active_report, JSON.stringify(Report));
		alert("Your report has been saved. If you wish to email this report, please click on the email button below.");
		$(this).addClass("hidden");
		$(".back").addClass("hidden");
		$("#mailto").removeClass("hidden");
	});

	$(".initialnext").on('click', function() {
		$("#welcome, .ini").addClass("hidden");
		$(this).addClass("hidden");
		$("#list, a.newreview").slideUp().removeClass("hidden");
		
		saveUserInfo();

		populateListHeader();
		populateTheList();	
	});

	$(".newreview").on('click', function() {
		
		populateListHeader();
		
		$("#customerinfo").get(0).reset();
		$("#list, .newreview").addClass("hidden");
		$("a.list, a.next,a.report, section#questions, .progressbar, .editbutton, #login, .numbered, #li11").removeClass("hidden");
		$(".orderedList li").removeClass("visible").css("left", "110%");
		$("#login").addClass("visible").css("left", "0px");
		$("#questions").scrollTop(0);

		if ($(window).width() > 550) {
			$(".numbered, #li11, #report, .back").addClass("hidden");
		}

		for (var i = 0; i < 19; i++) {
			$(".numbered, #li11").find("form").get(i).reset();
		}

		active_report = 'koaa_' + randomString(10);
		active_question = 0;
		Report.complete = "no";
		editButtonReset();
	});

	////////////////////////////////////////////////   NEXT
	$(".next").on('click', function() {
		active_question++;

		var iMan = $("#manager").val(),
			iCus = $("#customer").val(),
			iNames = iMan.split(" ");

		/*
if (iNames.length != 2) {
			alert("Please enter a first and last name.");
			return;
		}

		if (iCus.length < 1) {
			alert("Please enter a customer name.");
			return;
		}
*/

		////////////////////////////////////////////////   RESPONSIVE

		if ($(window).width() >= 550 && $("#login").hasClass("visible")) {
			$("#login").addClass("hidden").removeClass("visible");
			$(".numbered, #li11").removeClass("hidden").animate({
				left: "0px"
			}, 600);
			$("#li1").addClass("scrollhide");
			i = 10;
			generateReport();
			nextButtonGray();
			var bigWindowDone = true;

		} else if ($(window).width() > 550) {
			generateReport();
			$(this).addClass("hidden");
			$(".back").removeClass("hidden").css({
				"opacity": "1",
				"float": "right"
			});
			$(".numbered, #li11").addClass("hidden").css("left", "110%");
			$("#report").removeClass("hidden").show().animate({
				left: "0px"
			}, 600);
			$("#saveall").removeClass("hidden");
			$("#questions").scrollTop(0);
			$("#report").addClass("showing");

		} else {
			next();

			if ($("#report").hasClass("visible")) {
				$(".report, .next, .back").addClass("hidden");
				$("#saveall").removeClass("hidden");
			}

			setTimeout(function() {
				if (!$("#login").hasClass("visible")) {
					$(".back").css("opacity", "1").removeClass("hidden");
				}
			}, 100);
		}

		generateReport();
		populateHeader();

		if ($("#report").hasClass("visible") ) {
			$(".back").addClass("hidden");
			setTimeout(function() {
				alert("Please read through the report and check your answers. Once you are finished, remember to click the SAVE button at the bottom of this screen. After you have saved, an EMAIL button will appear and you can then email a copy of the review.");
			}, 600);
		}
		
		if ($("#report").hasClass("showing") ) {
			setTimeout(function() {
				alert("Please read through the report and check your answers. If you need to make edits, simply click the BACK button. Remember to click the SAVE button at the end, and be sure to email a copy.");
			}, 600);
		}

		questionsUp = 1;
	});
	
	////////////////////////////////////////////////  BACK
	$(".back").on('click', function() {
		active_question--;

		if ($(window).width() > 550) {
			$(this).addClass("hidden");
			$(".next").removeClass("hidden").css("opacity", "1");
			$("#report").addClass("hidden").css("left", "110%");
			$(".numbered, #li11").removeClass("hidden").show().animate({
				left: "0px"
			}, 600);
			$("#saveall").addClass("hidden");
			$("#questions").scrollTop(0);
			$("#report").removeClass("showing");
		} else {
			back();
		}
	});

	$(".list").on('click', function() {
		listClick();
		populateTheList();
		editButtonReset();
	});

	$(".save").on('click', function() {
		generateReport();
		populateHeader();

		$("#saveall").removeClass("hidden");

		if (suggestionVisible === false) {
			if ($(window).width() >= 550) {
				$("#login").addClass("hidden").removeClass("visible");
				$(".numbered, #li11").addClass("hidden");
				$("#report").removeClass("hidden").show();
				$("#report").animate({
					"left": "0px"
				}, 400);
				$("#questions").scrollTop(0);

			} else {
				$(".visible").animate({
					left: "-100%"
				});

				$("#list").addClass("hidden");

				setTimeout(function() {
					$(".visible").removeClass('visible');
					$("#report").addClass("visible").animate({
						"left": "0px"
					});
					$(".report").addClass("hidden");
					$(".next").addClass("hidden");
					$("#saveall").removeClass("hidden");
				}, 100);
			}
		}
	});

	function next() {
		var visible = $(".visible"),
			nextLi = visible.next("li");

		if (suggestionVisible === false) {
			visible.animate({
				left: "-100%"
			});
			setTimeout(function() {
				visible.removeClass('visible');
			}, 100);
			nextLi.animate({
				left: "0px",
				top: "0px"
			}).addClass("visible");
			progressAdd();
			$("#questions").scrollTop(0);
		}
		generateReport();
		populateHeader();
		nextButtonGray();
		i++;
		return i;
	}

	function back() {
		var visible = $(".visible"),
			prevLi = visible.prev("li");
		if (suggestionVisible === false) {
			visible.animate({
				left: "100%"
			});
			setTimeout(function() {
				visible.removeClass('visible');
			}, 100);
			prevLi.animate({
				left: "0px"
			}).addClass("visible");
			progressSubtract();
			$("#questions").scrollTop(0);
		}
		nextButtonGray();
		if ($("#login").hasClass("visible")) {
			$(".back").css("opacity", "0");
		}
		i--;
		return i;
	}

	$("#questions").on("scroll", function() {
		setTimeout(function() {
			$("#scrollformore").fadeTo("slow", 0);
		}, 500);
	});


	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////  CONTINUE REPORT
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#thelist").on("click", ".continue", function() {
		//Get active report from clicked li
		active_report = $(this).closest("li").data("role");

		//Update Report object with stored JSON
		Report = JSON.parse(window.localStorage.getItem(active_report));
		
		active_question = Report.activeQuestion;
		
		//Update information, questions and suggestions using Report object data
		$("#manager").val(Report.manager);
		$("#customer").val(Report.customer);
		$("#meeting").val(Report.meeting);
		$("#dateinput").val(Report.date);
		
		$("#header").html("<h5 class='manager'>" + Report.manager + "</h5><p class='customer'>" + Report.customer + "</p><p class='meeting'>" + Report.meeting + "</p><a class='edit' href='#'><img src='images/cog.png'/></a><time class='dateinput'>" + Report.date + "</time>");
		

		//Questions
		if (Report.q1 == "yes") {
			$("#yes1").prop('checked',true);
		} else if (Report.q1 == "no") {
			$("#no1").prop('checked',true);
		}
		
		if (Report.q2 == "yes") {
			$("#yes2").prop('checked',true);
		} else if (Report.q2 == "no") {
			$("#no2").prop('checked',true);
		}

		if (Report.q3 == "yes") {
			$("#yes3").prop('checked',true);
		} else if (Report.q3 == "no") {
			$("#no3").prop('checked',true);
		}

		if (Report.q4 == "yes") {
			$("#yes4").prop('checked',true);
		} else if (Report.q4 == "no") {
			$("#no4").prop('checked',true);
		}

		if (Report.q5 == "yes") {
			$("#yes5").prop('checked',true);
		} else if (Report.q5 == "no") {
			$("#no5").prop('checked',true);
		}

		if (Report.q6 == "yes") {
			$("#yes6").prop('checked',true);
		} else if (Report.q6 == "no") {
			$("#no6").prop('checked',true);
		}

		if (Report.q7 == "yes") {
			$("#yes7").prop('checked',true);
		} else if (Report.q7 == "no") {
			$("#no7").prop('checked',true);
		}

		if (Report.q8 == "yes") {
			$("#yes8").prop('checked',true);
		} else if (Report.q8 == "no") {
			$("#no8").prop('checked',true);
		}

		if (Report.q9 == "yes") {
			$("#yes9").prop('checked',true);
		} else if (Report.q9 == "no") {
			$("#no9").prop('checked',true);
		}

		if (Report.q10 == "yes") {
			$("#yes10").prop('checked',true);
		} else if (Report.q10 == "no") {
			$("#no10").prop('checked',true);
		}

		//Suggestions
		if (Report.s1 != "") {
			$("#suggestion1").text(Report.s1);
			$("#li1 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s2 != "") {
			$("#suggestion1").text(Report.s2);
			$("#li2 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s3 != "") {
			$("#suggestion1").text(Report.s3);
			$("#li3 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s4 != "") {
			$("#suggestion1").text(Report.s4);
			$("#li4 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s5 != "") {
			$("#suggestion1").text(Report.s5);
			$("#li5 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s6 != "") {
			$("#suggestion1").text(Report.s6);
			$("#li6 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s7 != "") {
			$("#suggestion1").text(Report.s7);
			$("#li7 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s8 != "") {
			$("#suggestion1").text(Report.s8);
			$("#li8 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s9 != "") {
			$("#suggestion1").text(Report.s9);
			$("#li9 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.s10 != "") {
			$("#suggestion1").text(Report.s10);
			$("#li10 .addnote").html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
		}

		if (Report.sOver != "") {
			$("#li11 textarea").val(Report.sOver);
		}

		//Jump to active question
		var startQuestion = "#li" + Report.activeQuestion,
			qCount = "li" + Report.activeQuestion;
		console.log( Report.activeQuestion);
		$("#list, .newreview").addClass("hidden");
		$("#questions, .next, .back, .list").removeClass("hidden");
		$(".back").css("opacity", "1");
		$("#login, .numbered, #li11, #report").css("left", "110%").removeClass("visible");
		$(startQuestion).css("left", "0").addClass("visible");
		$(".numbered").each(function(){
			var questionId = $(this).attr("id");
			if(questionId < qCount){
				$(this).css("left", "-110%");
			}
		});
		if($("#li1").hasClass("visible")){
			$(".back").addClass("hidden");
		}else{
			$(".back").removeClass("hidden");
		}
		if(Report.activeQuestion === 11){
			$("#report").css("left", "0").addClass("visible");
		}
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////  REPORTING
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	$("#thelist").on("click", ".view", function() {
		viewing = true;
		$("#list, .newreview").addClass("hidden");
		$(".numbered, #li11, #login").addClass("hidden");
		$(".visible").removeClass('visible');
		$("#report").addClass("visible").css("left", "0px");
		$("#questions, .list, #mailto, #report").removeClass("hidden");
		$("#questions").scrollTop(0);
		$(".editbutton").addClass("hidden");
		
		active_report = $(this).closest("li").data("role");
		
		var v = JSON.parse(localStorage.getItem(active_report));

		$(".one").html(v.q1);
		$(".two").html(v.q2);
		$(".three").html(v.q3);
		$(".four").html(v.q4);
		$(".five").html(v.q5);
		$(".six").html(v.q6);
		$(".seven").html(v.q7);
		$(".eight").html(v.q8);
		$(".nine").html(v.q9);
		$(".ten").html(v.q10);
		$("#header").html("<h5 class='manager'>" + v.manager + "</h5><p class='customer'>" + v.customer + "</p><p class='meeting'>" + v.meeting + "</p><a class='edit' href='#'><img src='images/cog.png'/></a><time class='dateinput'>" + v.date + "</time>");
		$(".meetingdatedisplay").html("<p>Meeting report will be sent to the client by " + v.meetDate + ".</p>");
		
		// SCORING
		$(".scorep").html(Math.ceil(v.score) + "%");

		if (v.scoreColor == "green") {
			$("#report .scorecircle").css("background-color", "#8dc149");
		} else if (v.scoreColor == "yellow") {
			$("#report .scorecircle").css("background-color", "#ffc851");
		} else {
			$("#report .scorecircle").css("background-color", "#f40000");
		}

		if (v.s1.length > 0) {
			$("div[data-role=suggestion1").html("<span>NOTES: </span>" + v.s1);
		}
		if (v.s2.length > 0) {
			$("div[data-role=suggestion2").html("<span>NOTES: </span>" + v.s2);
		}
		if (v.s3.length > 0) {
			$("div[data-role=suggestion3").html("<span>NOTES: </span>" + v.s3);
		}
		if (v.s4.length > 0) {
			$("div[data-role=suggestion4").html("<span>NOTES: </span>" + v.s4);
		}
		if (v.s5.length > 0) {
			$("div[data-role=suggestion5").html("<span>NOTES: </span>" + v.s5);
		}
		if (v.s6.length > 0) {
			$("div[data-role=suggestion6").html("<span>NOTES: </span>" + v.s6);
		}
		if (v.s7.length > 0) {
			$("div[data-role=suggestion7").html("<span>NOTES: </span>" + v.s7);
		}
		if (v.s8.length > 0) {
			$("div[data-role=suggestion8").html("<span>NOTES: </span>" + v.s8);
		}
		if (v.s9.length > 0) {
			$("div[data-role=suggestion9").html("<span>NOTES: </span>" + v.s9);
		}
		if (v.s10.length > 0) {
			$("div[data-role=suggestion10").html("<span>NOTES: </span>" + v.s10);
		}
		if (v.sOver.length > 0) {
			$("#reportoverall div").html("<p>" + v.sOver + "</p>");
		}

		$(".response").each(function() {
			if ($(this).html() == "no") {
				$(this).css("color", "#f40000");
			}else{$(this).css("color", "#8dc149");}
		});
		
		

	});

	$(".ans").on("click", function() {
		if (!viewing) {
			var thisData = $(this).data("list"),
				thisQuestion = $("#" + thisData + "");
			if ($(window).width() >= 550) {
				console.log("");
			} else {
				$(".orderedList li").removeClass("visible").css("left", "110%");
				$(".back").addClass("hidden");
				thisQuestion.addClass("visible").animate({
					"left": "0px"
				});
				$("#saveall").addClass("hidden");
				thisQuestion.find(".save").show(200);
				$("#questions").scrollTop(0);
			}
		}
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////  PROGRESS BAR
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	var progress = 8.333,
		progressBarWidth = Math.round(progress);

	function progressAdd() {
		progress += 8.333;
		progressBarWidth = Math.round(progress);
		$(".progressbar").animate({
			"width": progressBarWidth + "%"
		}, 400);
	}

	function progressSubtract() {
		progress -= 8.333;
		progressBarWidth = Math.round(progress);
		$(".progressbar").animate({
			"width": progressBarWidth + "%"
		}, 400);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   UPDATE BUTTON COLORS
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	function nextButtonGray() {
		$(".next").css({
			"background-color": "transparent",
			"background-image": "url(images/next.png)"
		});
	}

	function nextButtonGreen() {
		$(".next").css({
			"background-color": "rgba(255,255,255,0.7)",
			"background-image": "url(images/nextgreen.png)",
			"height": "80px"
		});
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   LOGIN
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	$(".loginbutton").on("click", function() {
		$(".loginbutton, .introcontain").hide();
		$(".ini").animate({
			top: "70px"
		}, 400);
		$(".initialnext").removeClass("hidden");
	});

	$(".ini").on("click", function() {
		$(".initialnext").removeClass("hidden");
	});

	$("#editarea").on("click", function() {
		$("#myinfo").animate({
			top: "0px"
		}, 200);
		
		if (userCount === 1) {
			var oldUser = $("#user").val(),
				oldPhone = $("#phone").val(),
				oldEmail = $("#email").val();
			$("#myinfo").find(".firstrow").html("<label for=userNew>Name</label><input id='userNew' type=text value='" + oldUser + "'>");
			$("#myinfo").find(".secondrow").html("<label for=phoneNew>Phone</label><input id='phoneNew' type=text value='" + oldPhone + "'>");
			$("#myinfo").find(".thirdrow").html("<label for=emailNew>Name</label><input id='emailNew' type=text value='" + oldEmail + "'>");
		} else {
			var newUser = $("#userNew").val(),
				newPhone = $("#phoneNew").val(),
				newEmail = $("#emailNew").val();
			$("#myinfo").find(".firstrow").html("<label for=userNew>Name</label><input id='userNew' type=text value='" + newUser + "'>");
			$("#myinfo").find(".secondrow").html("<label for=phoneNew>Phone</label><input id='phoneNew' type=text value='" + newPhone + "'>");
			$("#myinfo").find(".thirdrow").html("<label for=emailNew>Name</label><input id='emailNew' type=text value='" + newEmail + "'>");
		}
		
	});

	$("#dateinput").on("change", function() {
		nextButtonGreen();
	});

	$(".myinfobutton").on("click", function() {
		$("#myinfo").animate({
			top: "-2000px"
		}, 200);
		userCount = 2;
		saveNewUserInfo();
		populateListHeader();
		
		if (questionsUp === 0) {
			populateListHeader();
		}
		
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   ADD A SUGGESTION
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	var suggestionVisible = false;

	$(".addnote").on('click', function() {
		var thisAddnote = $(this);
	 	setTimeout(function() {
				thisAddnote.html("<p class='editnoteinside' style='font-size: 15px;'>EDIT</p>");
			}, 600);
		var suggestion = $(this).closest("li").find(".suggestion");
		if ($(window).width() >= 550) {
			$(suggestion).show().animate({
				top: "170px"
			}, {
				duration: 200,
				easing: "easeOutCirc"
			});
		} else {
			$(suggestion).show().animate({
				top: "70px"
			}, {
				duration: 200,
				easing: "easeOutCirc"
			});
		}
		
		suggestionVisible = true;
		nextButtonGray();
	});

	$(".suggestion button, .close").on("click", function() {
		$(".suggestion").animate({
			top: "2000px"
		}, {
			duration: 300,
			easing: "easeInCirc"
		});
		$(".suggestion").hide(600);
		var thisSuggestion = $(this).closest("aside").find("textarea"),
			thisSuggestionValue = thisSuggestion.val(),
			thisSuggestionId = thisSuggestion.attr("id"),
			reportSuggOutput = $("div[data-role='" + thisSuggestionId + "']");
		reportSuggOutput.show().html("<span>NOTES: </span>" + thisSuggestionValue);
		suggestionVisible = false;
		$("#questions").scrollTop(0);
		nextButtonGreen();
	});

	$(".suggestion textarea").on("click", function() {
		$(this).closest("form").find("button").show(200).css("display", "block");
	});

	$(".suggestion textarea").keyup(function() {
		var charcount = $(this).closest("form").find("p.charactercount");
		$(charcount).text("Characters remaining: " + (140 - $(this).val().length));
	});

	$("#li11 textarea").keyup(function() {
		var rcharcount = $(this).closest("li").find("p.rcharcount");
		$(rcharcount).text("Characters remaining: " + (140 - $(this).val().length));
	});

	$(".addsuggestion").on('click', function() {
		$(".suggestion").show().animate({
			top: "70px"
		}, {
			duration: 200,
			easing: "easeOutCirc"
		});
		suggestionVisible = true;
		nextButtonGray();
		var thisSpan = $(this).find("span").data("role"),
			thisSuggestionValue = $("#" + thisSpan + "").val();
		$("#suggestionview").html(thisSuggestionValue);
	});

	$(".suggestionreport button").on("click", function() {
		$(".suggestionreport").animate({
			top: "2000px"
		}, {
			duration: 300,
			easing: "easeInCirc"
		});
		$(".suggestionreport").hide(600);
		$("#questions").scrollTop(0);
		suggestionVisible = false;
		nextButtonGreen();
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   POPULATE HEADER
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	function populateHeader() {
		var manager = Report.manager,
			customer = Report.customer,
			meeting = Report.meeting,
			ogdate = Report.date,
			d = americanDate(ogdate);
		$("#header").html("<h5 class='manager'></h5><p class='customer'></p><p class='meeting'></p><a class='edit' href='#'><img src='images/cog.png'/></a><time class='dateinput'></time>");
		///////////////////////////  POPULATE THE LIST VALUES TOO    ////////////////////////////
		$(".manager").html(manager);
		$(".customer").html(customer);
		$(".meeting").html(meeting);
		if (d.length > 1) {
			$(".dateinput").html(d[1] + "/" + d[2] + "/" + d[0]);
		}
	}

	function populateListHeader() {
		var current_user = user;
		current_user = $.trim(current_user).split(" ");
		$("#header").html("<h5 class='listheader'>Welcome " + current_user[0] + "</h5><a class='edit' href='#'><img src='images/cog.png'/></a>");
	}

	// function populateListHeaderNew() {
	// 	var user2 = $("#userNew").val();
	// 	user2 = $.trim(user2).split(" ");
	// 	$("#header").html("<h5 class='listheader'>Welcome " + user2[0] + "</h5><a class='edit' href='#'><img src='images/cog.png'/></a>");
	// }

	function americanDate(str) {
		var arr = str.split('-');
		return arr;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   SORTING THE LIST AND FLYOUT
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	$(".sortlist").on("click", function() {
		if ($(".flyout").hasClass('flyoutvisible')) {
			$(".flyout").fadeOut(200).removeClass("flyoutvisible");
		} else {
			$(".flyout").fadeIn(200).addClass("flyoutvisible");
		}
	});

	$(".editlist").on("click", function() {
		if (!$(".thelist ul li").hasClass("skooched") && $(".thelist ul li").length > 0) {
			$(".thelist ul li").addClass("skooched").delay(200).animate({
				"padding": "10px 45px"
			});
			$(".reddash").removeClass("hidden").animate({
				"left": "7px"
			}, 200);
			$(".editlist p").html("DONE");
		} else {
			editButtonReset();
		}
	});


	function editButtonReset(){
		$(".editlist p").html("EDIT");
		$(".thelist ul li").css("padding", "10px 15px").removeClass("skooched");
		$(".reddash").addClass("hidden").css("left", "-200px");
	}
	
	
	
	$("#thelist").on("click", ".reddash", function() {
		if (!$(this).hasClass("rotatedred")) {
			$(this).css("transform", "rotate(90deg)").addClass("rotatedred");
			$(this).closest("li").find(".delete").show(200).css("right", "15px");
			$(this).closest("li").find(".listscorecircle").hide(200);
		} else {
			$(this).css("transform", "rotate(0deg)").removeClass("rotatedred");
			$(this).closest("li").find(".delete").css("right", "-100px").hide();
			$(this).closest("li").find(".listscorecircle").show(400);
		}
	});

	$("#thelist").on("click", ".delete", function() {
		if (confirm("Are you sure you want to permanently delete the selected item?")) {
			var key = $(this).closest("li").data("role");
			localStorage.removeItem(key);
			$(this).closest("li").remove();
		}
	});

	var descending = 1;
	$(".flyout").on("click", "#sortCus", function() {
		$(".flyout").fadeOut(400).removeClass("flyoutvisible");
		attaSort("h5", "cus");
	});
	$(".flyout").on("click", "#sortMan", function() {
		$(".flyout").fadeOut(400).removeClass("flyoutvisible");
		attaSort("p.manager", "man");
	});
	$(".flyout").on("click", "#sortDate", function() {
		$(".flyout").fadeOut(400).removeClass("flyoutvisible");
		attaSort("p.dateinput", "day");
	});

	function attaSort(ele, sortid) {
		var thelist = $("#thelist"),
			listItems = $("#thelist li"),
			vals = [],
			valsHTML = [],
			valsREV = [];

		for (var i = 0; i < listItems.length; i++) {
			var sortby = $(listItems[i]).find(ele).data(sortid);
			console.log(sortby);
			vals.push(sortby);
			console.log(vals);
		}

		if (descending === 1) {
			vals.sort();
			for (i = 0; i < listItems.length; i++) {
				var thisLi = $("#thelist").find("[data-" + sortid + "='" + vals[i] + "']");
				var thisLiHTML = thisLi.closest("li").html();
				valsHTML.push(thisLiHTML);
			}
			console.log(valsHTML);
			for (i = 0; i < listItems.length; i++) {
				listItems[i].innerHTML = valsHTML[i];
			}
			descending = 2;
		} else {
			vals.reverse();
			for (i = 0; i < listItems.length; i++) {
				var thatLi = $("#thelist").find("[data-" + sortid + "='" + vals[i] + "']");
				var thatLiHTML = thatLi.closest("li").html();
				valsREV.push(thatLiHTML);
			}
			console.log(valsHTML);
			for (i = 0; i < listItems.length; i++) {
				listItems[i].innerHTML = valsREV[i];
			}
			descending = 1;
		}
	}

	var lastName = "";


	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////   COLLECT FORM VALUES/ GENERATE REPORT
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	$(".no").on("click", function() {
		$(this).closest("li").find(".addnote").css("opacity", "1");
		nextButtonGreen();
	});
	$(".yes").on("click", function() {
		$(this).closest("li").find(".addnote").css("opacity", ".5");
		nextButtonGreen();
	});

	function generateReport() {
		if (typeof(Storage) !== "undefined") {
			Report.q1 = $("input[name=one]:checked").val();
			Report.q2 = $("input[name=two]:checked").val();
			Report.q3 = $("input[name=three]:checked").val();
			Report.q4 = $("input[name=four]:checked").val();
			Report.q5 = $("input[name=five]:checked").val();
			Report.q6 = $("input[name=six]:checked").val();
			Report.q7 = $("input[name=seven]:checked").val();
			Report.q8 = $("input[name=eight]:checked").val();
			Report.q9 = $("input[name=nine]:checked").val();
			Report.q10 = $("input[name=ten]:checked").val();
			Report.manager = $("#manager").val();
			Report.customer = $("#customer").val();
			Report.meeting = $("#meeting").val();
			Report.date = $("#dateinput").val();
			Report.s1 = $("#suggestion1").val();
			Report.s2 = $("#suggestion2").val();
			Report.s3 = $("#suggestion3").val();
			Report.s4 = $("#suggestion4").val();
			Report.s5 = $("#suggestion5").val();
			Report.s6 = $("#suggestion6").val();
			Report.s7 = $("#suggestion7").val();
			Report.s8 = $("#suggestion8").val();
			Report.s9 = $("#suggestion9").val();
			Report.s10 = $("#suggestion10").val();
			Report.sOver = $("#li11 textarea").val();
		} else {
			alert("Storage is unavailable on your device.");
		}
		
		var score = 0,
			overallsuggestions = $("#li11 textarea").val(),
			firstQuestion = $("#li1 input:checked").val();
		$("input[value=yes]:checked").each(function() {
			score += 7.778;
		});
		
		if (firstQuestion == "yes") {
			score += 22;
		}

		if (i > 9) {
			$(".score").html(Math.ceil(score) + "%");
		}

		if (firstQuestion == "yes") {
			$(".scorecircle").css("background-color", "#8dc149");
			Report.scoreColor = "green";
		} else if (score > 38 && firstQuestion == "no") {
			$(".scorecircle").css("background-color", "#ffc851");
			Report.scoreColor = "yellow";
		} else {
			$(".scorecircle").css("background-color", "#f40000");
			Report.scoreColor = "red";
		}

		$("#reportoverall div").html("<p>" + overallsuggestions + "</p>");
		radioReport();
		gatherSuggestions();
		displayMeetingDate();
		viewing = false;
		Report.score = score;

		Report.activeQuestion = active_question;

		updateReport();
	}

	function populateTheList() {
		/////////////////////////////////////////////  POPULATE THE LIST 
		$("#thelist").html("");
		for (i = 0; i < window.localStorage.length; i++) {
			try {
				var obj = JSON.parse(window.localStorage.getItem(window.localStorage.key(i)));
				if (obj.name == "After Action Report") {
					var df = americanDate(obj.date),
						manLast = getLastName(obj.manager);
					if (df.length === 1) {
						var objectDate = "";
					} else {
						var objDate = df[1] + "/" + df[2] + "/" + df[0];
					}
					if (obj.complete == "yes") {
						$("#thelist").prepend('<li data-role="' + localStorage.key(i) + '"><div class="reddash hidden">-</div><div class="delete" data-role="record' + localStorage.key(i) + '">DELETE</div><h5 class="customer" data-cus="' + obj.customer + '">' + obj.customer + '</h5><p class="manager" data-man="' + manLast + '">' + obj.manager + '</p><p class="meeting">' + obj.meeting + '</p><p class="dateinput" data-day="' + Math.round(new Date(objDate).getTime()/1000) + '">' + objDate + '</p><div class="listscorecircle"><p class="score" id="listscorep">' + Math.ceil(obj.score) + '%</p></div><div class="view" data-role="' + localStorage.key(i) + '"><p id="viewbutton">VIEW</p></div></li>'); /* console.log(obj); */
					} else {
						$("#thelist").prepend('<li data-role="' + localStorage.key(i) + '"><div class="reddash hidden">-</div><div class="delete" data-role="record' + localStorage.key(i) + '">DELETE</div><h5 class="customer" data-cus="' + obj.customer + '">' + obj.customer + '</h5><p class="manager" data-man="' + manLast + '">' + obj.manager + '</p><p class="meeting">' + obj.meeting + '</p><p class="dateinput" data-day="' + Math.round(new Date(objDate).getTime()/1000) + '">' + objDate + '</p><div class="listscorecircle"><p class="score" id="listscorep">' + Math.ceil(obj.score) + '%</p></div><div class="continue" data-role="' + localStorage.key(i) + '"><p id="continue">CONTINUE</p></div></li>');
					}
					var thisScoreCircle = $("li[data-role='" + localStorage.key(i) + "']").find(".listscorecircle");
					if (obj.scoreColor == "green") {
						$(thisScoreCircle).css("background-color", "#8dc149");
					} else if (obj.scoreColor == "yellow") {
						$(thisScoreCircle).css("background-color", "#ffc851");
					} else {
						$(thisScoreCircle).css("background-color", "#f40000");
					}
				} // if obj.name
			} catch (e) {
				console.log('Value is not JSON, skipping');
			}	
		} // end for loop
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////  MISC FUNCTIONS
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	function isiPhone() {
		return ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1));
	}

	function radioReport() {
		$("input:checked").each(function() {
			var eachname = $(this).attr("name"),
				eachvalue = $(this).val();
			if (eachvalue === "no") {
				$("." + eachname).css("color", "#f40000");
			} else {
				$("." + eachname).css("color", "#8dc149");
			}
			$("." + eachname).html(eachvalue);
		});
	}

	function gatherSuggestions() {
		$(".suggestion textarea").each(function() {
			var suggValue = $(this).val(),
				suggId = $(this).attr('id');
			if (suggValue.length > 0) {}
		});
	}

	function displayMeetingDate() {
		var theDate = $("#datepicker").val();
		Report.meetDate = americanDate(theDate);
		$(".meetingdatedisplay").html("<p>Meeting report will be sent to the client by " + Report.meetDate + ".</p>");
	}

	function listClick() {
	console.log(Report.complete);
		questionsUp = 0;
		$("#questions, .list, .report, .back, .next, .progressbar, #mailto, #saveall").addClass("hidden");
		$("#list, .newreview").removeClass("hidden");
		$(".addnote").html('<div class="noteinside"><span>SUGGESTION</span></div>');
		$("#report").removeClass("showing");
		//if (userCount === 1) {
			populateListHeader();
		//} else {
		//	populateListHeaderNew();
		//}
	}

	function getLastName(el) {
		if (el.length > 1) {
			var hisName = el.split(' ');
			lastName = hisName[1];
			return lastName;
		}
	}

	function checkForTwoNames() {
		var iMan = $("#manager").val(),
			iNames = iMan.split(" ");
		if (iNames.length != 2) {
			alert("Please enter a first and last name.");
			return;
		}
	}

	function randomString(length) {
		var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
		var result = '';
		for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
		return result;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////  EMAIL
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	$("#mailto").click(function() {
		sendEmail(active_report);
	});

	function sendEmail(active_report) {
        
        //Fetch active report and parse JSON
        var obj = JSON.parse(localStorage.getItem(active_report));
        
        //Last name fix for attachment name
        var lastname = obj.customer;
        lastname = lastname.substring(lastname.indexOf(" "));
        lastname = lastname.replace(/\s+/g, '');
        
        //Email Vars
        var attachment_name = lastname + "-after-action-review.html";
        var subject = "(" + obj.customer + ") - After Action Review";
        var body = "<p>Attached is the After Action Review for the following:</p><p>&nbsp;</p><p>Meeting: " + obj.meeting + "</p><p>Manager: " + obj.manager + "</p><p>Customer: " + obj.customer + "</p><p>Date: " + obj.date + "</p>";

        //Email Attachment Content
        var email ='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
        + '<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml" style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<head><!-- If you delete this meta tag, Half Life 3 will never be released. -->'
        + '<meta name="viewport" content="width=device-width" />'
        + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
        + '<title>After Action Review</title></head>'
        + '<body bgcolor="#FFFFFF" style="font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;">'
        + '<table bgcolor="#f40000" style="font-family: Helvetica, Arial, sans-serif; width: 100%; margin: 0; padding: 0;">'
        + '<tr style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<td style="font-family: Helvetica, Arial, sans-serif; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto; padding: 0;"><div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; display: block; margin: 0 auto; padding: 15px;">'
        + '<table bgcolor="#f40000" style="font-family: Helvetica, Arial, sans-serif; width: 100%; margin: 0; padding: 0;">'
        + '<tr style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<td align="center" style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;"><h3 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: white; font-weight: 500; font-size: 27px; margin: 0; padding: 0;">After Action Review</h3></td>'
        + '</tr></table></div></td></tr></table>'
        + '<table style="font-family: Helvetica, Arial, sans-serif; width: 100%; margin: 0; padding: 0;">'
        + '<tr style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<td bgcolor="#FFFFFF" style="font-family: Helvetica, Arial, sans-serif; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto; padding: 0;"><div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; display: block; margin: 0 auto; padding: 15px;">'
        + '<table style="font-family: Helvetica, Arial, sans-serif; width: 100%; margin: 0; padding: 0;">'
        + '<tr style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<td style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;"><h6 style="font-family: Helvetica, Arial, sans-serif; line-height: .6em; color: #999; font-weight: 500; font-size: 17px; margin: 0 0 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">Customer: </span>' + obj.customer + '</h6>'
        + '<h6 style="font-family: Helvetica, Arial, sans-serif; line-height: .6em; color: #999; font-weight: 500; font-size: 17px; margin: 0 0 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">Customer Manager: </span>' + obj.manager + '</h6>'
        + '<h6 style="font-family: Helvetica, Arial, sans-serif; line-height: .6em; color: #999; font-weight: 500; font-size: 17px; margin: 0 0 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">Meeting: </span>' + obj.meeting + '</h6>'
        + '<h6 style="font-family: Helvetica, Arial, sans-serif; line-height: .6em; color: #999; font-weight: 500; font-size: 17px; margin: 0 0 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">Date: </span>' + obj.date + '</h6></td>'
        + '</tr></table><br style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;" />'
        + '<table style="font-family: Helvetica, Arial, sans-serif; width: 100%; margin: 0; padding: 0;">'
        + '<tr style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<td style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;"><h2 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #000; font-weight: 200; font-size: 27px; float: left; margin: 0 0 15px; padding: 0;">Overall Score</h2>'
        + '<aside style="font-family: Helvetica, Arial, sans-serif; width: 50px; height: 50px; box-sizing: border-box; float: right; text-align: center;  margin: -13px 0 0; padding: 13px 0;">'
        + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: bold; font-size: 27px; line-height: 1.4; margin: 0 0 10px; padding: 0; color: #999">' + Math.ceil(obj.score) + '%</p>'
        + '</aside></td></tr></table>'
        + '<br style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;" />'
        + '<table style="font-family: Helvetica, Arial, sans-serif; width: 100%; margin: 0; padding: 0;">'
        + '<tr style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">'
        + '<td style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;"><p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">1</span>Did we achieve our planned destination for this meeting?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q1 + '</h5>';
        
        if (obj.s1 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s1 + '</p>';
        }
        
        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">2</span>Did we begin with a discussion of the customer&rsquo;s needs?</p>'
        + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"> Did our understanding of the needs resonate well with the customer and connect to their operating model?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q2 + '</h5>';
        
        if (obj.s2 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s2 + '</p>';
        }
        
        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">3</span>Did we use active listening skills to build rapport and clarify their needs?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q3 + '</h5>';

        if (obj.s3 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s3 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">4</span>Did we have a clear statement of our big idea?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q4 + '</h5>';

        if (obj.s4 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s4 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">5</span>Did we give a clear explanation of how our proposal works with the level of detail appropriate for attendees?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q5 + '</h5>';

        if (obj.s5 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s5 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">6</span>Did we demonstrate the benefits of our proposal for their business in a way that was believable to the customer?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q6 + '</h5>';

        if (obj.s6 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s6 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">7</span>Did the presentation meet our standards for CFV presentations?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q7 + '</h5>';

        if (obj.s7 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s7 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">8</span>Did we handle objections (LAPROC) and close effectively?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q8 + '</h5>';

        if (obj.s8 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s8 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">9</span>Do we have clear takeaways from the meeting and the insights needed to create the meeting report for the customer?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q9 + '</h5>';

        if (obj.s9 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s9 + '</p>';
        }

        email = email + '<p style="font-family: Helvetica, Arial, sans-serif; position: relative; font-weight: normal; font-size: 16px; line-height: 1.4; margin: 0 0 10px 15px; padding: 0;"><span style="font-family: Helvetica, Arial, sans-serif; position: absolute; left: -30px; top: -8px; font-weight: bold; font-size: 27px; color: #fff; width: 30px; height: 30px; text-align: center; margin: 0; padding: 0;">10</span>Did we achieve effective stewardship as a part of this meeting?</p>'
        + '<h5 style="font-family: Helvetica, Arial, sans-serif; line-height: 1.1; color: #97f446; font-weight: 900; font-size: 17px; margin: 0 0 15px 15px; padding: 0;">' + obj.q10 + '</h5>';

        if (obj.s10 != "") {
            email = email + '<p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">SUGGESTIONS:  </span>' + obj.s10 + '</p>';
        }

        if (obj.sOver != "") {
            email = email + '<p>&nbsp;</p><p style="font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size: 16px; line-height: 1.4; background-color: #ECF8FF; margin: 0 0 15px 15px; padding: 15px;"><span style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">OVERALL SUGGESTIONS:  </span>' + obj.sOver + '</p>';
        }

        email = email + '</td></tr></table></div></td></tr></table></body></html>';

        //Convert to Base64
        var emailb64 = btoa(email);
        
        //window.plugins.emailComposer.showEmailComposerWithCallback(callback,subject,body,toRecipients,ccRecipients,bccRecipients,isHtml,attachments,attachmentsData);
        window.plugins.emailComposer.showEmailComposerWithCallback(
            null,
            subject,
            body,
            [],
            [],
            [],
            true,
            [],
            [[attachment_name,emailb64]]
        );
    }
}