var _DeviceType = 'P';
var NowURL = (location.href).toLowerCase();
var _SiteType = (NowURL.indexOf("/teacher/") > -1) ? "T" : "";

var _event_freedown = "N";	// 무료다운로드 flag

var _IsMatchSvc = "";	// // 학교 ★ 맞춤 / (2021-06-24 / 김진국)

function Login(Domain)
{
    if (typeof(Domain) == 'undefined') Domain = '';

    document.frmLoginRefer.action = Domain + "/Member/Login.asp";
    document.frmLoginRefer.submit();
}

// 초등 파일 다운로드
function Elem_ExamDownload(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype) {
	document.domain = "zocbo.com";

    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
	if (typeof (Grade) == 'undefined') Grade = '';
	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';

    var IsChk_History = true;
	var chk_result;

    _ExPapr_No = ExPapr_No;
    _Exfl_Group = Exfl_Group;
    _SiteID = SiteID;

    // 로그인 및 권한 체크
    if (!Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype)) {
        return;
    }

	if (IsChk_History) {
		// 다운로드 기록 체크
		/*
			결과값 : 0 다운로드 기록이 없음...
			결과값 : 1 재다운로드지만 30일 기간 지남..
			결과값 : 2 재다운로드지만 30일 기간 안지남..
			결과값 : 3 취소
		*/
		chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);

		switch (chk_result) {
		  case 2  : ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드 (@param flag:1)
					return;
    				break;
		  case 3  : return;
					break;
		}
	}

	ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드 (@param flag:2)
}

// 예상족보 전용 - 선택 단원이 변경되면 무조건 차감..
function CreateExamDownload(ExPapr_No, Exfl_Group, SiteID, Part_ID_Set, Part_Down_Seq, exam_Index) {
	// 로그인 및 권한 체크
    if (!Download_Check(ExPapr_No, Exfl_Group, '', '', '', '')) {
        return;
    }

	ExamDownload_Confirm_V(ExPapr_No, Exfl_Group, SiteID, 2, Part_ID_Set, Part_Down_Seq, exam_Index);
}


/*
	이벤트등으로 인해 유료다운로드를 무료로받게 처리 (2020.09.14, 정효태)
	다만, 다운로그는 별도 테이블에 저장. 재다운로드 방지
*/
function Event_Free_ExamDownload(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype) {
	_event_freedown = "Y";

	Download(ExPapr_No, Exfl_Group, 1, ExPapr_No);

	//ExamDownload(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype);
}


// 중등, 고등 파일 다운로드
function ExamDownload(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype, IsMatchSvc, PreTerm) {
	_event_freedown = "N";

    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
	if (typeof (Grade) == 'undefined') Grade = '';
	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';

    var IsChk_History = true;
	var chk_result;

    // 일부 학교별 예상족보는 중복다운로드 체크를 하지 않는다.
    //if (ExPapr_Group == 'V' && (Subj_Code == 'LS' || Subj_Code == 'HI' || Subj_Code == 'SC' || (SiteID == 'H' && Subj_Code == 'MT')))
	//{
    //    IsChk_History = false;
    //}

    _ExPapr_No = ExPapr_No;
    _Exfl_Group = Exfl_Group;
    _SiteID = SiteID;

	_IsMatchSvc = IsMatchSvc;  // 학교★맞춤 : MatchSvc, 기존 : ''

//	console.log(1, _event_freedown);

    // 로그인 및 권한 체크

	if(_event_freedown == "Y" || (ExPapr_Group == "X" && exPapr_Coretype == "X") || IsMatchSvc == "viewer_SCAN") {		// 이벤트 무료 다운로드 (2020.09.14, 정효태)	//미리보는 기말고사 예외처리

	}	
	else {
		if (!Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype)) {
			return;
		}
	}

    //if (ExPapr_Group == 'V' && IsAutoExamDown == false) {
	//	ExamDownload_AutoExam();
	if (ExPapr_Group == 'B') {
		preparation_Chapter(zUser_ID, ExPapr_No, Subj_Code, SiteID, Grade);
    } else if (ExPapr_Group == "X" && exPapr_Coretype == "X") {
        ExamDownload_AutoExam_PreTest_New(Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype, IsMatchSvc, PreTerm);
    } else {
		// 고등 > 학평변형 다운로드 안내창 구분을 위한 분기처리.
		if (SiteID == "H" && ExPapr_Group == "D" && exPapr_Coretype == "E") {
			if (IsChk_History) {
				// 다운로드 기록 체크
				/*
				결과값 : 0 다운로드 기록이 없음...
				결과값 : 1 재다운로드지만 30일 기간 지남..
				결과값 : 2 재다운로드지만 30일 기간 안지남..
				결과값 : 3 취소
				*/
				chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);

				switch (chk_result) {
					case 2  : TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
							return;
							break;
					case 3  : return;
							break;
				}
			}

			TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드
		}
		else {
			if (IsChk_History) {
				// 다운로드 기록 체크
				/*
				결과값 : 0 다운로드 기록이 없음...
				결과값 : 1 재다운로드지만 30일 기간 지남..
				결과값 : 2 재다운로드지만 30일 기간 안지남..
				결과값 : 3 취소
				*/

				if (ExPapr_Group == 'V' || IsMatchSvc == "viewer_SCAN") {
					chk_result = 0
				} else {
					chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);
				}

				switch (chk_result) {
					case 2  : ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
							return;
							break;
					case 3  : return;
							break;
				}
			}

			if(IsMatchSvc == 'viewer' || IsMatchSvc == 'viewer_SCAN')
			{
				ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 3);   // 3 == 뷰어 정답 보기 레이어 팝업 띄우기 위함
			}
			else
			{
				ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드
			}
		}
    }
}

// 예상족보중등, 고등 파일 다운로드
function AutoExamDownload(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype,PartID_Set)
{
	_event_freedown = "N";

    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
	if (typeof (Grade) == 'undefined') Grade = '';
	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';
	if (typeof (PartID_Set) == 'undefined') PartID_Set = '';

	var chk_result;
    _ExPapr_No = ExPapr_No;
    _Exfl_Group = Exfl_Group;
    _SiteID = SiteID;

				chk_result = AutoExamDownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID,PartID_Set);
				if (chk_result == 4)
				{
					return true;
				}
				switch (chk_result)
				{
					case 2  : ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1,PartID_Set);  //재 다운로드
							return;
							break;
					case 3  : return;
							break;

				}


			ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2,PartID_Set);   //일반 다운로드


}

// 빠른족보 파일 다운로드
function ExamDownloadQuick(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype)
{
	alert('이벤트가 종료되었습니다.');


//    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
//    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
//    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
//	if (typeof (Grade) == 'undefined') Grade = '';
//	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';
//
//    var IsChk_History = false;
//	var chk_result;
//
//    _ExPapr_No = ExPapr_No;
//    _Exfl_Group = Exfl_Group;
//    _SiteID = SiteID;
//
//
//    // 로그인 및 권한 체크
//    if (!Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype)) {
//        return;
//    }
//
//    // 학교별예상족보는 중등 과학,사회,역사/고등 수학,사회,국사,과학의 경우 최초 클릭시 무조건 AutoExam을 호출한다.
//    // 이후 범위 선택 페이지에서 다운로드 클릭 시에는 IsAutoExamDown값을 true로 보내 Download가 이루어진다.
//    if (ExPapr_Group == 'V' && IsAutoExamDown == false)
//	{
//        ExamDownload_AutoExam();
//    }
//	else
//	{
//		//console.log(2, IsChk_History, ExPapr_No, Exfl_Group, SiteID);
//
//		// 고등 > 학평변형 다운로드 안내창 구분을 위한 분기처리.
//		if (SiteID == "H" && ExPapr_Group == "D" && exPapr_Coretype == "E")
//		{
//			if (IsChk_History) {
//				// 다운로드 기록 체크
//				/*
//				결과값 : 0 다운로드 기록이 없음...
//				결과값 : 1 재다운로드지만 30일 기간 지남..
//				결과값 : 2 재다운로드지만 30일 기간 안지남..
//				결과값 : 3 취소
//				*/
//				chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);
//
//				switch (chk_result)
//				{
//					case 2  : TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
//							return;
//							break;
//					case 3  : return;
//							break;
//				}
//			}
//
//			TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드
//		}
//		else
//		{
//			if (IsChk_History)
//			{
//				// 다운로드 기록 체크
//				/*
//				결과값 : 0 다운로드 기록이 없음...
//				결과값 : 1 재다운로드지만 30일 기간 지남..
//				결과값 : 2 재다운로드지만 30일 기간 안지남..
//				결과값 : 3 취소
//				*/
//				chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);
//
//				//console.log(3, IsChk_History, ExPapr_No, Exfl_Group, SiteID, chk_result);
//
//				switch (chk_result)
//				{
//					case 2  : ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
//							return;
//							break;
//					case 3  : return;
//							break;
//				}
//			}
//
//			//ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드
//			Download(ExPapr_No, Exfl_Group);
//		}
//    }
}

function TransformExamDownload(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype) {
    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
	if (typeof (Grade) == 'undefined') Grade = '';
	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';

    var IsChk_History = true;
	var chk_result;
    // 일부 학교별 예상족보는 중복다운로드 체크를 하지 않는다.
    if (ExPapr_Group == 'V' && (Subj_Code == 'LS' || Subj_Code == 'HI' || Subj_Code == 'SC' || (SiteID == 'H' && Subj_Code == 'MT'))) {
        IsChk_History = false;
    }

    _ExPapr_No = ExPapr_No;
    _Exfl_Group = Exfl_Group;
    _SiteID = SiteID;

    // 로그인 및 권한 체크

    if (!Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype)) {
        return;
    }

    // 학교별예상족보는 중등 과학,사회,역사/고등 수학,사회,국사,과학의 경우 최초 클릭시 무조건 AutoExam을 호출한다.
    // 이후 범위 선택 페이지에서 다운로드 클릭 시에는 IsAutoExamDown값을 true로 보내 Download가 이루어진다.
    if (ExPapr_Group == 'V' && IsAutoExamDown == false) {
        ExamDownload_AutoExam();
    } else {

		if (IsChk_History) {
			// 다운로드 기록 체크

			/*
			결과값 : 0 다운로드 기록이 없음...
			결과값 : 1 재다운로드지만 30일 기간 지남..
			결과값 : 2 재다운로드지만 30일 기간 안지남..
			결과값 : 3 취소

			*/
			chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);


			switch (chk_result) {
			  case 2  : TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
						return;
						break;
			  case 3  : return;
						break;
			}

		}

		TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드

    }
}

function ExamDownload_Tweezers_Zocbo(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype) {
    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
	if (typeof (Grade) == 'undefined') Grade = '';
	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';
	if (typeof (flag_Num) == 'undefined') exPapr_Coretype = 0;

    var IsChk_History = true;
	var chk_result;
    // 일부 학교별 예상족보는 중복다운로드 체크를 하지 않는다.
    if (ExPapr_Group == 'V' && (Subj_Code == 'LS' || Subj_Code == 'HI' || Subj_Code == 'SC' || (SiteID == 'H' && Subj_Code == 'MT')))
	{
        IsChk_History = false;
    }

    _ExPapr_No = ExPapr_No;
    _Exfl_Group = Exfl_Group;
    _SiteID = SiteID;

    // 로그인 및 권한 체크
    //if (!Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype)) {
	if (!Download_Check(6970681, 6, "C", "MT", "2", ""))
	{
        return;
    }

    // 학교별예상족보는 중등 과학,사회,역사/고등 수학,사회,국사,과학의 경우 최초 클릭시 무조건 AutoExam을 호출한다.
    // 이후 범위 선택 페이지에서 다운로드 클릭 시에는 IsAutoExamDown값을 true로 보내 Download가 이루어진다.
    if (ExPapr_Group == 'V' && IsAutoExamDown == false)
	{
        ExamDownload_AutoExam();
    }
	else
	{
        if (IsChk_History)
		{
            // 다운로드 기록 체크
			/*
			결과값 : 0 다운로드 기록이 없음...
			결과값 : 1 재다운로드지만 30일 기간 지남..
			결과값 : 2 재다운로드지만 30일 기간 안지남..
			결과값 : 3 취소
			*/
			chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);

			switch (chk_result)
			{
				case 2  : ExamDownload_Confirm_Tweezers_Zocbo(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
						//ExamDownload_Confirm_Tweezers(6970681, 6, "M", 1);  //재 다운로드
						return;
						break;
				case 3  :
						return;
						break;
			}
		}
		ExamDownload_Confirm_Tweezers_Zocbo(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드
		//ExamDownload_Confirm_Tweezers(6970681, 6, "M", 2);   //일반 다운로드
    }
}

function ExamDownload_Tweezers_Etoos(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype) {
    if (typeof (ExPapr_Group) == 'undefined') ExPapr_Group = '';
    if (typeof (IsAutoExamDown) == 'undefined') IsAutoExamDown = false;
    if (typeof (Subj_Code) == 'undefined') Subj_Code = '';
	if (typeof (Grade) == 'undefined') Grade = '';
	if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';
	if (typeof (flag_Num) == 'undefined') exPapr_Coretype = 0;

    var IsChk_History = true;
	var chk_result;
    // 일부 학교별 예상족보는 중복다운로드 체크를 하지 않는다.
    if (ExPapr_Group == 'V' && (Subj_Code == 'LS' || Subj_Code == 'HI' || Subj_Code == 'SC' || (SiteID == 'H' && Subj_Code == 'MT')))
	{
        IsChk_History = false;
    }

    _ExPapr_No = ExPapr_No;
    _Exfl_Group = Exfl_Group;
    _SiteID = SiteID;

    // 로그인 및 권한 체크
    //if (!Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype)) {
	if (!Download_Check(6970681, 7, "C", "MT", "2", ""))
	{
        return;
    }

    // 학교별예상족보는 중등 과학,사회,역사/고등 수학,사회,국사,과학의 경우 최초 클릭시 무조건 AutoExam을 호출한다.
    // 이후 범위 선택 페이지에서 다운로드 클릭 시에는 IsAutoExamDown값을 true로 보내 Download가 이루어진다.
    if (ExPapr_Group == 'V' && IsAutoExamDown == false)
	{
        ExamDownload_AutoExam();
    }
	else
	{
        if (IsChk_History)
		{
            // 다운로드 기록 체크
			/*
			결과값 : 0 다운로드 기록이 없음...
			결과값 : 1 재다운로드지만 30일 기간 지남..
			결과값 : 2 재다운로드지만 30일 기간 안지남..
			결과값 : 3 취소
			*/
			chk_result = DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID);

			switch (chk_result)
			{
				case 2  : ExamDownload_Confirm_Tweezers_Etoos(ExPapr_No, Exfl_Group, SiteID, 1);  //재 다운로드
						//ExamDownload_Confirm_Tweezers(6970681, 7, "M", 1);  //재 다운로드
						return;
						break;
				case 3  :
						return;
						break;
			}
		}
		ExamDownload_Confirm_Tweezers_Etoos(ExPapr_No, Exfl_Group, SiteID, 2);   //일반 다운로드
		//ExamDownload_Confirm_Tweezers(6970681, 7, "M", 2);   //일반 다운로드
    }
}

// 로그인 및 권한 체크
function Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype, flag, SiteID) {
	if (typeof (SiteID) == 'undefined') SiteID = '';
	if (typeof (_SiteID) == 'undefined') _SiteID = SiteID;

    var Download_Auth = false;
	var MenuGbn = '1';
	var iframe_Status = (window.location != window.parent.location);

    jQuery.ajax({
        type: 'POST',
        //url: '/Common/ExamDownload/DownloadCheck_v1.asp',
		url: '/Common/ExamDownload/DownloadCheck_v2.asp',
		//url: _url,		// 테스트
        timeout: 30000,
        cache: false,
        async: false,
        data: { ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group, SiteType: _SiteType },
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function(e) {
            alert(e.message+"현재 접속자 수가 많아 일시적으로 서비스가 원활하지 않습니다.\n\n잠시 후에 다시 접속해 주시기 바랍니다. 이용에 불편을 드려 죄송합니다.");
        },
        success: function(data) {
            if (data == '0') {
                Download_Auth = true;
            } else {
                switch (data) {
                    case "-1": // 동시 접속 체크 시 DB오류
                        alert("현재 접속자 수가 많아 일시적으로 서비스가 원활하지 않습니다.\n\n잠시 후에 다시 접속해 주시기 바랍니다. 이용에 불편을 드려 죄송합니다.");
                        break;
                    case "-2": // 일정시간 사용없음. 로그아웃
                        alert("일정시간 동안 이용되지 않아 고객님의 정보보호를 위해 로그아웃되었습니다.\n“확인”을 누르시고 다시 로그인하여 주시기 바랍니다.");
                        Logout(); return;
                        break;
                    case "-3": // 중복 로그인. 로그아웃
                        alert("사용 중인 아이디가 로그아웃 되었습니다.\n1. 일정 시간동안 사용이 없는 경우\n2. 다른 기기에서 로그인한 경우\n다른 사용자가 로그인 한 것으로 판단 되시면 비밀번호를 변경하시기 바랍니다.\n로그인 하시면 다시 사용 가능합니다.");
                        Logout(); return;
                        break;
                    case "1": // 로그인 전
						if(opener && typeof(move_Parent) == "function") {
							move_Parent();
						} else {
							if(iframe_Status == true)
							{
								layerOpen('loginpopname');
							}
							else
							{
								layerOpen('loginpopname');
							}
						}

                        break;
                    case "2": // 시험지 데이터 없음
                        alert("현재 시험지의 속성 정보가 없습니다.");
                        break;
                    case "999": // 다운로드 권한 없음
                        if (!confirm("다운로드 권한이 없으십니다.\n\n무료회원은 족보이용권을 구매해 주십시요.\n\n이용권 구매 페이지로 이동하시겠습니까?"))
                            break;

                        var SettlementPath;
                        if (_SiteType == "T") {
                            SettlementPath = '/ZocboSettlement/Default_pay2.asp'
                        } else {
                            switch (_SiteID) {
                                case 'E':
                                    if (NowURL.indexOf("ZocboExamOverall") > -1)  //초등은 이용권 구매 페이지가 총괄과 상시로 나눠져 있으므로 URL에서 폴더명을 추출해서 이동 페이지를 구분
                                    {
                                        SettlementPath = '/ZocboElem/ZocboSettlement/PayZocboExamOverall.asp';
                                    }
                                    else {
                                        SettlementPath = '/ZocboElem/ZocboSettlement/';
                                    }
                                    break;
                                case 'M':
									// 수행마스터는 현재 포인트로만 구매가 가능해서 포인트 구매 페이지로 분기 처리
									if(ExPapr_Group == 'T' && (exPapr_Coretype == 'A' || exPapr_Coretype == 'B' || exPapr_Coretype == 'C'))
									{
										SettlementPath = '/ZocboSettlement/rnpay5.asp';
									}
									else
									{
										SettlementPath = '/ZocboSettlement/';
									}
									break;
                                case 'H': SettlementPath = '/ZocboSettlement/'; break;
                                default: SettlementPath = '/ZocboSettlement/'; break;
                            };
                        }
						window.location.href = SettlementPath;
                        break;
					case "4":	// 중등 포인트/이용권 있음
						if (confirm('중등 학생용 사이트에서 구매하신 상품은 \n중등 학생용 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('4', 'M', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					case "5":	// 고등 포인트/이용권 있음
						if (confirm('고등 학생용 사이트에서 구매하신 상품은 \n고등 학생용 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('5', 'H', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					case "6":	// 교강사-중등 포인트/이용권 있음
						if (confirm('족보 선생님 사이트에서 구매하신 상품은 \n선생님 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('6', 'M', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					case "7":	// 교강사-고등 포인트/이용권 있음
						if (confirm('족보 선생님 사이트에서 구매하신 상품은 \n선생님 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('7', 'H', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					default:

                }
            }
        }
    });

    return Download_Auth;
}

function HighEng_Download_Check(ExPapr_No, Exfl_Group, ExPapr_Group, Subj_Code, Grade, exPapr_Coretype, flag)
{
    var Download_Auth = false;
	var MenuGbn = '1';
	var iframe_Status = (window.location != window.parent.location);

    jQuery.ajax({
        type: 'POST',
        url: '/Common/ExamDownload/HighEng_DownloadCheck.asp',
        timeout: 30000,
        cache: false,
        async: false,
        data: { ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group, SiteType: _SiteType},
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function(e) {

            alert(e.message+"현재 접속자 수가 많아 일시적으로 서비스가 원활하지 않습니다.\n\n잠시 후에 다시 접속해 주시기 바랍니다. 이용에 불편을 드려 죄송합니다.");
        },
        success: function(data) {
            if (data == '0') {
                Download_Auth = true;
            } else {
                switch (data) {
                    case "-1": // 동시 접속 체크 시 DB오류
                        alert("현재 접속자 수가 많아 일시적으로 서비스가 원활하지 않습니다.\n\n잠시 후에 다시 접속해 주시기 바랍니다. 이용에 불편을 드려 죄송합니다.");
                        break;
                    case "-2": // 일정시간 사용없음. 로그아웃
                        alert("일정시간 동안 이용되지 않아 고객님의 정보보호를 위해 로그아웃되었습니다.\n“확인”을 누르시고 다시 로그인하여 주시기 바랍니다.");
                        Logout(); return;
                        break;
                    case "-3": // 중복 로그인. 로그아웃
                        alert("사용 중인 아이디가 로그아웃 되었습니다.\n1. 일정 시간동안 사용이 없는 경우\n2. 다른 기기에서 로그인한 경우\n다른 사용자가 로그인 한 것으로 판단 되시면 비밀번호를 변경하시기 바랍니다.\n로그인 하시면 다시 사용 가능합니다.");
                        Logout(); return;
                        break;
                    case "1": // 로그인 전
						if(opener && typeof(move_Parent) == "function") {
							move_Parent();
						} else {
							if(iframe_Status == true)
							{
								layerOpen('loginpopname');
							}
							else
							{
								layerOpen('loginpopname');
							}
						}

                        break;
                    case "2": // 시험지 데이터 없음
                        alert("현재 시험지의 속성 정보가 없습니다.");
                        break;
                    case "999": // 다운로드 권한 없음
                        if (!confirm("다운로드 권한이 없으십니다.\n\n무료회원은 족보이용권을 구매해 주십시요.\n\n이용권 구매 페이지로 이동하시겠습니까?"))
                            break;

                        var SettlementPath;
                        if (_SiteType == "T") {
                            SettlementPath = '/ZocboSettlement/Default_pay2.asp'
                        } else {
                            switch (_SiteID) {
                                case 'E':
                                    if (NowURL.indexOf("ZocboExamOverall") > -1)  //초등은 이용권 구매 페이지가 총괄과 상시로 나눠져 있으므로 URL에서 폴더명을 추출해서 이동 페이지를 구분
                                    {
                                        SettlementPath = '/ZocboElem/ZocboSettlement/PayZocboExamOverall.asp';
                                    }
                                    else {
                                        SettlementPath = '/ZocboElem/ZocboSettlement/';
                                    }
                                    break;
                                case 'M':
									// 수행마스터는 현재 포인트로만 구매가 가능해서 포인트 구매 페이지로 분기 처리
									if(ExPapr_Group == 'T' && (exPapr_Coretype == 'A' || exPapr_Coretype == 'B' || exPapr_Coretype == 'C'))
									{
										SettlementPath = '/ZocboSettlement/rnpay5.asp';
									}
									else
									{
										SettlementPath = '/ZocboSettlement/';
									}
									break;
                                case 'H': SettlementPath = '/ZocboSettlement/'; break;
                                default: SettlementPath = '/ZocboSettlement/'; break;
                            };
                        }
						window.location.href = SettlementPath;
                        break;
					case "4":	// 중등 포인트/이용권 있음
						if (confirm('중등 학생용 사이트에서 구매하신 상품은 \n중등 학생용 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('4', 'M', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					case "5":	// 고등 포인트/이용권 있음
						if (confirm('고등 학생용 사이트에서 구매하신 상품은 \n고등 학생용 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('5', 'H', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					case "6":	// 교강사-중등 포인트/이용권 있음
						if (confirm('족보 선생님 사이트에서 구매하신 상품은 \n선생님 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('6', 'M', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					case "7":	// 교강사-고등 포인트/이용권 있음
						if (confirm('족보 선생님 사이트에서 구매하신 상품은 \n선생님 사이트에서만 사용 가능합니다.\n이동하시겠습니까?'))
						{
							location.href = locationURL('7', 'H', Grade, Subj_Code, ExPapr_Group, exPapr_Coretype);
						}
						break;
					default:

                }
            }
        }
    });

    return Download_Auth;
}

// <summary>파일 다운로드 권한체크시 리턴 URL 처리</summary>
// <param name="UrlType">이동 페이지 타입</param>
// <param name="SiteID">M:중등,H:고등</param>
// <param name="Grade">학년</param>
// <param name="Subj_Code">과목코드</param>
// <param name="ExPapr_Group">메뉴그룹_1</param>
// <param name="exPapr_Coretype>메뉴그룹_2</param>
function locationURL(UrlType, SiteID, Grade, Subj_Code, ExPapr_Group, exPapr_Coretype) {
	var returnURL, teacherURL;
	var menuGbn = '1';

	// 교강사 공통으로 사용되는 기본 URL (교강사는 1개의 URL에서 파라메터로 메뉴별 구분을 한다. )
	teacherURL = '/Teacher/TeacherExam/Default.asp?SiteID=' + SiteID + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&Group=' + ExPapr_Group + '&exPapr_Coretype=' + exPapr_Coretype;
	switch (UrlType)
	{
		// 컨텐츠 팀과 협의하여 기출, 단원별, 나머지는 해당 메인으로 이동 하는것으로 협의함! (2019-09-06 / 작업자 : 김진국)
		case '4':	// 중등 관련 페이지로 이동
			switch (ExPapr_Group)
			{
				// 학교별족보 (예상족보)
				//case 'V': returnURL = '/ZocboMid/ZocboExamSchool/default.asp?Grade=' + Grade + '&Subj_Code=' + Subj_Code; break;

				// 학교별족보 (기출족보)
				case 'A': returnURL = '/ZocboMid/ZocboExamSchool/PreviousExam.asp?Grade=' + Grade + '&Subj_Code=' + Subj_Code; break;

				// 단원별
				case 'C': returnURL = '/ZocboMid/ZocboExam/Exam_Unit.asp?Grade=' + Grade + '&Subj_Code=' + Subj_Code; break;

				case 'K':
					switch (exPapr_Coretype)
					{
						// 교과서 변형
						case 'F': returnURL = '/ZocboMid/ZocboExam/mathtranslaformation.asp?Grade=' + Grade;
					}
					break;

				// 나머지
				default: returnURL = '/ZocboMid/'; break;
			}
			break;
		case '5':	// 고등 관련 페이지로 이동
			switch (ExPapr_Group)
			{
				// 학교별족보 (예상족보)
				//case 'V': returnURL = '/ZocboHigh/ZocboExamSchool/default.asp?Grade=' + Grade + '&Subj_Code=' + Subj_Code; break;

				// 학교별족보 (기출족보)
				case 'A': returnURL = '/ZocboHigh/ZocboExamSchool/PreviousExam.asp?Grade=' + Grade + '&Subj_Code=' + Subj_Code; break;

				// 유형별분석족보 (최다빈출, 최다오답, 영어문법문제(출판사별), 수학유형별문제)
				/*case 'H':
					switch (exPapr_Coretype)
					{
						//최다빈출
						case 'D': returnURL = '/ZocboHigh/ZocboExam/Exam_Most.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

						//최다오답
						case 'E': returnURL = '/ZocboHigh/ZocboExam/Exam_MostWrong.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

						//영어문법문제(출판사별)
						case 'T': returnURL = '/ZocboHigh/ZocboExam/Exam_EngGrammar.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

						//수학 유형별 문제
						case 'C': returnURL = '/ZocboHigh/ZocboExam/Exam_MathType.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;
					}
					break;
				// 유형별분석족보 (고난이도)
				case 'S': returnURL = '/ZocboHigh/ZocboExam/Exam_Hard.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

				// 유형별분속족보 (시대별 문학, 수학계산력문제, 고등영문법)
				case 'K':
					switch (exPapr_Coretype)
					{
						//시대별 문학
						case 'R5': returnURL = '/ZocboHigh/ZocboExam/Exam_Timeliterary.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

						//수학 계산력 문제
						case 'B1': returnURL = '/ZocboHigh/ZocboExam/Exam_MathCalculation.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

						//고등 영문법
						case 'C1': returnURL = '/ZocboHigh/ZocboExam/Default_EG.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;
					}
					break;
				*/
				// 단원별족보
				case 'C': returnURL = '/ZocboHigh/ZocboExam/Exam_Unit.asp?Group=' + ExPapr_Group + '&Grade=' + Grade + '&Subj_Code=' + Subj_Code + '&exPapr_Coretype=' + exPapr_Coretype; break;

				case 'K':
					switch (exPapr_Coretype)
					{
						// 교과서 변형
						case 'F': returnURL = '/ZocboHigh/ZocboExam/mathtranslaformation.asp?Grade=' + Grade;
					}
					break;

				// 나머지
				default: returnURL = '/ZocboHigh/'; break;
			}
			break;
		case '6':	// 교강사-중등 관련 페이지로 이동
			switch (ExPapr_Group)
			{
				case 'V': returnURL = teacherURL + '&MenuGbn=31'; break;		// 학교별 예상문제
				case 'A': returnURL = teacherURL + '&MenuGbn=31'; break;		// 학교별 기출문제

				case 'K':
					switch (exPapr_Coretype)
					{
						// 교과서 변형
						case 'F': returnURL = '/Teacher/MathTranslaformation/Default.asp?SiteID=' + SiteID + '&Grade=' + Grade;
					}
					break;

				default: returnURL = teacherURL + '&MenuGbn=1'; break;
			}
			break;
		case '7':	// 교강사-고등 관련 페이지로 이동
			switch (ExPapr_Group)
			{
				case 'V': returnURL = teacherURL + '&MenuGbn=32'; break;		// 학교별 예상문제
				case 'A': returnURL = teacherURL + '&MenuGbn=32'; break;		// 학교별 기출문제

				case 'K':
					switch (exPapr_Coretype)
					{
						// 교과서 변형
						case 'F': returnURL = '/Teacher/MathTranslaformation/Default.asp?SiteID=' + SiteID + '&Grade=' + Grade;
					}
					break;

				default: returnURL = teacherURL + '&MenuGbn=2'; break;
			}
			break;
		default:
			returnURL = '/ZocboMid/ZocboExamSchool/default.asp?Grade=' + Grade + '&Subj_Code=' + Subj_Code;
			break;
	}

	return returnURL;
}

// 다운로드 기록 체크
function DownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID) {
    var ExistExamdown = false;
    jQuery.ajax({
        async: false,
        //url: "/Common/ExamDownload/DownloadHistory_Check_v1.asp",
		url: "/Common/ExamDownload/DownloadHistory_Check_v2.asp",
		//url: _url,
        data: { SiteID: SiteID, ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group },
        success: function(data) {
            if (data == '0') ExistExamdown = true;
        }
    });

	/*
		결과값 : 0 다운로드 기록이 없음...
		결과값 : 1 재다운로드지만 30일 기간 지남..
		결과값 : 2 재다운로드지만 30일 기간 안지남..
		결과값 : 3 취소
	*/

    if(ExistExamdown) {
		//이미 재 다운로드이지만 30일 기간 체크를 한다.
		if(ReDownExam_ck(ExPapr_No, Exfl_Group, SiteID)) {
			if (confirm("이미 다운받은 자료입니다.\n\n최초 다운로드 일 기준 30일 이내로 무료로 \n\n다운로드 하실 수 있습니다. \n\n다운로드 하시겠습니까?")) {
				return 2;
			} else {
				return 3;
			}
		} else {	//30일이 지난 다운로드
			if (confirm("이미 다운받은 자료입니다.\n\n재 다운로드 시 포인트 또는 건 수가 차감 됩니다.\n\n다운로드 하시겠습니까?")) {
				return 1;
			} else {
				return 3;
			}
		}
    } else {
        return 0;
    }
}

// 다운로드 기록 체크
function AutoExamDownloadHistory_Check(ExPapr_No, Exfl_Group, SiteID, Part_Id_Set) {
    var ExistExamdown = false;
	var returnData = 0;
    jQuery.ajax({
        async: false,
        //url: "/Common/ExamDownload/DownloadHistory_Check_v1.asp",
		url: "/Common/ExamDownload/DownloadHistory_Check_v2.asp",
		data: { SiteID: SiteID, ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group, PartId_Set: Part_Id_Set },
        success: function(data) {
			returnData = data;
            if (data == '0')
			{
				ExistExamdown = true;
			}
        }
    });

/*
	data = 0 // 재다운로드 확인
	data = 1  // 일반 다운로드
    data = 4 //  새로 생성
	//console.log(SiteID, ExistExamdown);
/*
결과값 : 0 다운로드 기록이 없음...
결과값 : 1 재다운로드지만 30일 기간 지남..
결과값 : 2 재다운로드지만 30일 기간 안지남..
결과값 : 3 취소

*/

    if (ExistExamdown) {
		//이미 재 다운로드이지만 30일 기간 체크를 한다.
		if (ReDownExam_ck(ExPapr_No, Exfl_Group, SiteID))
		{

			if (confirm("이미 다운받은 자료입니다.\n\n최초 다운로드 일 기준 30일 이내로 무료로 \n\n다운로드 하실 수 있습니다. \n\n다운로드 하시겠습니까?")) {
				return 2;
			}else{
				return 3;
			}


		}else{//30일이 지난 다운로드
			if (confirm("이미 다운받은 자료입니다.\n\n재 다운로드 시 포인트 또는 건 수가 차감 됩니다.\n\n다운로드 하시겠습니까?")) {
				return 1;
			}else{
				return 3;
			}
		}

    } else {
        return returnData;
    }
}


// 다운로드 기록 체크
function fn_Check_DownloadHistory(ExPapr_No, Exfl_Group, SiteID, SiteType, Expapr_Group, Expapr_CoreType) {
    var ExistExamdown = false;

    jQuery.ajax({
        async: false,
        //url: "/Common/ExamDownload/DownloadHistory_Check_v1.asp",
		url: "/Common/ExamDownload/DownloadHistory_Check_v2.asp",
        data: { SiteID: SiteID, ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group, SiteType: _SiteType, Expapr_Group: Expapr_Group, Expapr_CoreType : Expapr_CoreType},
        success: function(data) {
            if (data == '0') ExistExamdown = true;
        }
    });

	//console.log(SiteID, ExistExamdown);
/*
결과값 : 0 다운로드 기록이 없음...
결과값 : 1 재다운로드지만 30일 기간 지남..
결과값 : 2 재다운로드지만 30일 기간 안지남..
결과값 : 3 취소

*/
    if (ExistExamdown) {
		//이미 재 다운로드이지만 30일 기간 체크를 한다.
		if (ReDownExam_ck(ExPapr_No, Exfl_Group, SiteID))
		{
			if (confirm("이미 다운받은 자료입니다.\n\n최초 다운로드 일 기준 30일 이내로 무료로 \n\n다운로드 하실 수 있습니다. \n\n다운로드 하시겠습니까?")) {
				return 2;
			}else{
				return 3;
			}
		}else{//30일이 지난 다운로드
			if (confirm("이미 다운받은 자료입니다.\n\n재 다운로드 시 포인트 또는 건 수가 차감 됩니다.\n\n다운로드 하시겠습니까?")) {
				return 1;
			}else{
				return 3;
			}
		}

    } else {
        return 0;
    }
}

// 재 다운로드 30일 기간 체크
function ReDownExam_ck(ExPapr_No, Exfl_Group, SiteID) {
    var ExistExamdown = false;

    jQuery.ajax({
        async: false,
		//url: "/Common/ExamDownload/ReDownExam_ck_v1.asp",
		url: "/Common/ExamDownload/ReDownExam_ck_v2.asp",
		//url: _url,
        data: { SiteID: SiteID, ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group },
        success: function(data) {
            if (data == '0') ExistExamdown = true;
        }
    });

    return ExistExamdown;

}

// 파일 재다운로드
function ExamDownload_ReDown(ExPapr_No, Exfl_Group, Down_No, Auto_Down_Seq, exam_Index) {
	if (typeof (Auto_Down_Seq) == 'undefined') Auto_Down_Seq = '0';
	if (typeof (exam_Index) == 'undefined') exam_Index = '';

	var ExamdownYN = false;

    jQuery.ajax({
        async: false,        
		url: "/MyPage/ReDown_Check_v2.asp",		
        data: { Down_No: Down_No, ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group },
        success: function(data) {
            //if (data == '0') ExamdownYN = true;
			if (data == '0') {
				ExamdownYN = true;
				Download(ExPapr_No, Exfl_Group, 1, Down_No, Auto_Down_Seq, exam_Index);
			} else {				
				if (data == '2') {
					ExamdownYN = true;
					Download(ExPapr_No, Exfl_Group, 1, Down_No, Auto_Down_Seq, exam_Index);
				} else {
					ExamdownYN = true;
					Download(ExPapr_No, Exfl_Group, 1, Down_No, Auto_Down_Seq, exam_Index);
				}
			}
        },
		error: function(request, status, error) {
			alert('서버 통신 오류 입니다.');
		}
    });	

	/*
    if (ExamdownYN) {    
        Download(ExPapr_No, Exfl_Group, 1, Down_No, Auto_Down_Seq, exam_Index);
    } else {	
		alert("파일 다운로드 시간으로부터 한달이 경과하여 재다운로드를 하실 수 없습니다.");
    }
	*/
}

// 학교별 예상문제 자동출제
function ExamDownload_AutoExam() {
    var cw = 500;
    var ch = 500;
    var px = (screen.availWidth - cw) / 2;
    var py = (screen.availHeight - ch) / 2;
    var pos = "titlebar=no,toolbar=no,directories=no,status=yes,menubar=no,"
               + "scrollbars=yes,resizable=yes,width=" + ch + ",height=" + ch + ",left=" + px + ",top=" + py;
    var popurl = '/ZocboMid/ZocboExamSchool/AutoExam.asp?ExPapr_No=' + _ExPapr_No + '&IsMatchSvc=' + _IsMatchSvc;    

	// 예상족보 로그인창 오류로 인한 팝업 name 변경 / 2022-05-11
    //var ExPop = window.open(popurl, 'ExPop', pos);
	var ExPop = window.open(popurl, 'AutoExPop', pos);
    ExPop.focus();
}

function preparation_Chapter(zUser_ID, ExPapr_No, Subj_Code, SiteID, Grade) {
	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
	}
	else
	{
		if (!Download_Check(ExPapr_No, '2', 'B', Subj_Code, Grade, '', SiteID)) {
			return;
		}

		layer_Chapter('chapter', ExPapr_No);
	}
	
	return;

//    var cw = 500;
//    var ch = 500;
//    var px = (screen.availWidth - cw) / 2;
//    var py = (screen.availHeight - ch) / 2;
//    var pos = "titlebar=no,toolbar=no,directories=no,status=yes,menubar=no,"
//               + "scrollbars=yes,resizable=yes,width=" + ch + ",height=" + ch + ",left=" + px + ",top=" + py;
//    var popurl = '/ZocboMid/ZocboExam/preparation_Chapter.asp?ExPapr_No=' + _ExPapr_No;    
//
//	// 예상족보 로그인창 오류로 인한 팝업 name 변경 / 2022-05-11
//    //var ExPop = window.open(popurl, 'ExPop', pos);
//	var ExPop = window.open(popurl, 'AutoExPop', pos);
//    ExPop.focus();
}

function preparation_Chapter_Cloud_Edit(zUser_ID, ExPapr_No) {
	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
	}
	else
	{
		layer_Chapter_CloudEdit('chapter', ExPapr_No);
	}
	
	return;
}

// 학교별 예상문제 자동출제
function ExamDownload_AutoExam_V2(zUser_ID, ExPapr_Group, ExPapr_No, Subj_Code, SiteID, Grade, part_ID_Set, exam_Index, Down_Chk) {
	// 3 : toggle 관련 > 다운로드 발생 Data Log 적재	
	var current_toggle = ($j("span#btn_toggle_c").parent("button").hasClass("teacher")) ? "T" : "C";
	fetch("/Include/ajax/toggle_action_log_insert_ajax.asp?log_type=3&exam_type=AUTOEXAM&expapr_no="+ExPapr_No+"&current_toggle="+current_toggle);	
	// End
	let storageBoxViewCheck = isValueEmpty(GetCookie("appSync")) || current_toggle != "C" ? "N" : "Y";
	
	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
	}
	else
	{
		if(Down_Chk == 'Y' || $j('[data-btn-group="2"][data-btn-no="'+ExPapr_No+'"][data-exam-index="'+exam_Index+'"]').hasClass("reconfirm"))
		{
			if (storageBoxViewCheck != "N") {
				ExamDownload_Confirm_V_Storage(ExPapr_No, 2, SiteID, 2, part_ID_Set, '', exam_Index);
			} else {
				layerOpen_2('process', exam_Index);
			}
		}
		else
		{
			if (!Download_Check(ExPapr_No, '2', ExPapr_Group, Subj_Code, Grade, '', SiteID)) {
				return;
			}

			layerOpen_2('process', exam_Index);
		}
	}
	
	return;
}

// 미리보는 XX고사 자동출제
function ExamDownload_AutoExam_PreTest(Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype, IsMatchSvc, PreTerm) {
    var cw = 500;
    var ch = 500;
    var px = (screen.availWidth - cw) / 2;
    var py = (screen.availHeight - ch) / 2;
    var pos = "titlebar=no,toolbar=no,directories=no,status=yes,menubar=no,"
               + "scrollbars=yes,resizable=yes,width=" + ch + ",height=" + ch + ",left=" + px + ",top=" + py;
    var popurl = '/ZocboMid/ZocboExamSchool/AutoExamPreTest.asp?SiteID=' + SiteID + '&ExPapr_Group=' + ExPapr_Group + '&Subj_Code=' + Subj_Code + '&Grade=' + Grade + '&exPapr_Coretype=' + exPapr_Coretype + '&PreTerm=' + PreTerm;

    var ExPop = window.open(popurl, 'ExPop', pos);
    ExPop.focus();

	//alert('ExamDownload_AutoExam');
}

// 미리보는 XX고사 자동출제_리뉴얼
function ExamDownload_AutoExam_PreTest_New(Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype, IsMatchSvc, PreTerm) {
    var cw = 500;
    var ch = 500;
    var px = (screen.availWidth - cw) / 2;
    var py = (screen.availHeight - ch) / 2;
    var pos = "titlebar=no,toolbar=no,directories=no,status=yes,menubar=no,"
               + "scrollbars=yes,resizable=yes,width=" + ch + ",height=" + ch + ",left=" + px + ",top=" + py;
    //var popurl = '/ZocboMid/ZocboExamSchool/autoExamPreTest_new.asp?SiteID=' + SiteID + '&ExPapr_Group=' + ExPapr_Group + '&Subj_Code=' + Subj_Code + '&Grade=' + Grade + '&exPapr_Coretype=' + exPapr_Coretype + '&PreTerm=' + PreTerm;
    var popurl = '/ZocboMid/ZocboExamSchool/autoExamPreTest.asp?SiteID=' + SiteID + '&ExPapr_Group=' + ExPapr_Group + '&Subj_Code=' + Subj_Code + '&Grade=' + Grade + '&exPapr_Coretype=' + exPapr_Coretype + '&PreTerm=' + PreTerm;

    var ExPop = window.open(popurl, 'ExPop', pos);
    ExPop.focus();
}


// 파일 다운
function Download(ExPapr_No, Exfl_Group, IsReDown, Down_No, Auto_Down_Seq, exam_Index) {
	// 다운로드 시 태그매니저, 로거 관련 쿠키는 삭제가 안되서 요기서 삭제
	document.cookie = 'NA_SAC=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
	document.cookie = 'NA_SA=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.zocbo.com;path=/;';
	document.cookie = '_TRK_CQ=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.zocbo.com;path=/;';

	/*document.cookie = 'TS0163d06f=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
	document.cookie = 'TS0163d06f=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.zocbo.com;path=/;';
	document.cookie = 'TS0163d06f=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=www.zocbo.com;path=/;';

	document.cookie = 'TS01d02b1b=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
	document.cookie = 'TS01d02b1b=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.zocbo.com;path=/;';
	document.cookie = 'TS01d02b1b=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=www.zocbo.com;path=/;';
	*/


	/*if (document.cookie && document.cookie != '') {
		var split = document.cookie.split(';');
		for (var i = 0; i < split.length; i++) {
			var name_value = split[i].split("=");
			name_value[0] = name_value[0].replace(/^ /, '');
			if(name_value[0].indexOf("ASPSESSIONID") != -1) {
				//console.log(name_value[0], name_value[0].indexOf("ASP"));
				document.cookie = name_value[0]+'=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
			}
		}
	}*/
	// End
	
    if (typeof (IsReDown) == 'undefined') IsReDown = '';
    if (typeof (Down_No) == 'undefined') Down_No = '';
	if (typeof (Auto_Down_Seq) == 'undefined') Auto_Down_Seq = '';
	if (typeof (exam_Index) == 'undefined') exam_Index = '';

    var kst = "N";
    if (document.getElementById("kst") != null) kst = document.getElementById("kst").value;

    // 건수 차감 & 다운로드
    jQuery.ajax({
        //url: "/Common/ExamDownload/DownloadComplete_v1.asp",
		url: "/Common/ExamDownload/DownloadComplete_v2.asp",
		//url: _url,
        async: false,
        data: { ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group, DeviceType: _DeviceType, IsReDown: IsReDown, exDownNo: Down_No, Sitetype: _SiteType, kst: kst, evt_free: _event_freedown, Auto_Down_Seq: Auto_Down_Seq},
        error: function() {
            alert("오류가 발생하였습니다. 잠시후 다시 시도해주세요.");
        },
        success: function(data) {
            switch (data) {
                case '0': alert("로그인이 필요한 서비스입니다."); return; break;
                case '1': alert("시험지 속성이 없습니다."); return; break;			// 1값이 넘어오는 경우 있을 수 있을 듯 하여 일단 유지
				//case '2': alert("다운로드 권한이 없습니다.!!!"); return; break;
				case '2': alert("시험지 속성이 없습니다."); return; break;			// 1 -> 2 변경
                case '999': alert("다운로드 권한이 없습니다.!!!"); return; break;		// 2 -> 3 변경
				case '4': location.reload(); return; break;
				//case '4': window.location.href = window.location.href + '&rtnResult=0'; return; break;
                default:
					//User_Point_Call();

                    if (IsReDown == '') Down_No = data;

					try {
						if(Exfl_Group == '2' || Exfl_Group == '3' || Exfl_Group == '4') {
							// 2:pdf, 3:scan, 4:hwp
							//jQuery('[data-btn-group="' + Exfl_Group + '"][data-btn-no="' + ExPapr_No + '"]').addClass("gray");

							if(Auto_Down_Seq != '' && Auto_Down_Seq != 0) // 예상족보의 경우에는 스토리지로 재다운로드 버튼 표시하지 않고 별도 처리
							{
								//jQuery('[data-btn-group="' + Exfl_Group + '"][data-btn-no="' + ExPapr_No + '"][data-exam-index="' + exam_Index + '"]').addClass("gray");
								jQuery('[data-btn-group="' + Exfl_Group + '"][data-btn-no="' + ExPapr_No + '"][data-exam-index="' + exam_Index + '"]').addClass("reconfirm");
							}
							else // 예상족보 외 컨텐츠는 스토리지로 재다운로드 버튼 표시 관리
							{
								//appendLocalStorageData(ExPapr_No,Exfl_Group);	
								(window.opener == null) ? appendLocalStorageData(ExPapr_No,Exfl_Group) : opener.parent.appendLocalStorageData(ExPapr_No,Exfl_Group);
							}

							if(Exfl_Group == '2' || Exfl_Group == '4') {
								var preSrc = (jQuery('[data-bts-no="' + ExPapr_No + '"]').hasClass("renewal2024-btn-download-wrongnote"));

								if(preSrc === true) {
									jQuery('[data-bts-no="' + ExPapr_No + '"]').attr("class", "renewal2024-btn-download-right");
								}

//								var preSrc = (jQuery('[data-bts-no="' + ExPapr_No + '"]').attr("src"));
//
//								if(preSrc == "/Images/zocbo_rn/sub/common/ico_wa_note.gif") {
//									jQuery('[data-bts-no="' + ExPapr_No + '"]').attr("src", "/Images/zocbo_rn/sub/common/ico_wa_anwer.gif");
//								}
							}
						}
					} catch(e){
						// pass
					}
					// 다운로드

                    var inputs = "<input type='hidden' name='ExPapr_No' value='" + ExPapr_No + "' /><input type='hidden' name='Exfl_Group' value='" + Exfl_Group + "' /><input type='hidden' name='DeviceType' value='" + _DeviceType + "' />"
                               + "<input type='hidden' name='kst' value='" + kst + "' /><input type='hidden' name='IsReDown' value='" + IsReDown + "' /><input type='hidden' name='exDownNo' value='" + Down_No + "' />"
                               + "<input type='hidden' name='Sitetype' value='" + _SiteType + "' /><input type='hidden' name='evt_free' value='" + _event_freedown + "' /><input type='hidden' name='Auto_Down_Seq' value='" + Auto_Down_Seq + "' />"
							   + "<input type='hidden' name='exam_Index' value='" + exam_Index + "' />";

					jQuery("<form name='frmDownload' action='/Common/ExamDownload/DownloadAct_v2.asp' method='get'>" + inputs + "</form>").appendTo("body").submit().remove();

					// 예비중1은 다운로드 시 그래프 최신화 작업
					if(window.location.pathname.toLowerCase().includes("/premid1/zocboexam/") && IsReDown != "1") {
						jQuery.ajax({
							url: "/premid1/zocboExam/ajax/graph_update_ajax.asp",
							async: false,
							data: {},
							dataType: 'json',
							error: function() {
								alert("오류가 발생하였습니다. 잠시후 다시 시도해주세요.");
							},
							success: function(data) {
								arrCnt = data.cnt.split('|');

								var A_Cnt = parseInt(jQuery("#A_Cnt").val());
								var C_Cnt = parseInt(jQuery("#C_Cnt").val());
								var E_Cnt = parseInt(jQuery("#E_Cnt").val());
								var D_Cnt = parseInt(jQuery("#D_Cnt").val());
								var B_Cnt = parseInt(jQuery("#B_Cnt").val());
								var Sum_Cnt = parseInt(jQuery("#Sum_Cnt").val());

								var A_Down_Cnt = parseInt(arrCnt[0]);
								var C_Down_Cnt = parseInt(arrCnt[1]);
								var E_Down_Cnt = parseInt(arrCnt[2]);
								var D_Down_Cnt = parseInt(arrCnt[3]);
								var B_Down_Cnt = parseInt(arrCnt[4]);
								var Sum_Down_Cnt = parseInt(arrCnt[5]);

								const bar = document.querySelector(".barGraph span");  // 막대바
								const donut = document.getElementsByClassName("donut")[0]; //진단 평가
								const donut2 = document.getElementsByClassName("donut")[1]; //국어
								const donut3 = document.getElementsByClassName("donut")[2]; //영어
								const donut4 = document.getElementsByClassName("donut")[3]; //수학
								const donut5 = document.getElementsByClassName("donut")[4]; //실전 모의고사
								
								//막대그래프
								let bart = 0;
								let totalMinwon = ((Sum_Down_Cnt / Sum_Cnt) * 100).toFixed(1);
								bar.style.width = 0;

								const barAnimation = setInterval(() => {
								  bar.style.width =  bart + '%'
								  bart++ >= totalMinwon && clearInterval(barAnimation)
								}, 10);

								jQuery("#sum_graph_txt").text(totalMinwon + '%');
								jQuery(".Sum_txt").text("(" + Sum_Down_Cnt + "/" + Sum_Cnt + ")");

								//진단 평가
								let donut1 = 0;
								let donutTotalMinwon = ((A_Down_Cnt / A_Cnt) * 100);

								if(donutTotalMinwon > 99) {
									if(A_Down_Cnt != A_Cnt) {
										donutTotalMinwon = 99;
									}
								}

								const donutAnimation = setInterval(() => {
								  donut.dataset.percent = donut1
								  donut.style.background = `conic-gradient(#0082FB 0 ${donut1}%, #072369 ${donut1}% 100% )`
								  donut1++ >= donutTotalMinwon && clearInterval(donutAnimation)
								}, 10);

								jQuery(".A_txt").text(A_Down_Cnt + "/" + A_Cnt);

								//국어
								let donut2c = 0;
								let donutTotalMinwon2 = ((C_Down_Cnt / C_Cnt) * 100);

								if(donutTotalMinwon2 > 99) {
									if(C_Down_Cnt != C_Cnt) {
										donutTotalMinwon2 = 99;
									}
								}

								const donutAnimation2 = setInterval(() => {
								  donut2.dataset.percent = donut2c
								  donut2.style.background = `conic-gradient(#4013F1 0 ${donut2c}%, #072369 ${donut2c}% 100% )`
								  donut2c++ >= donutTotalMinwon2 && clearInterval(donutAnimation2)
								}, 10);

								jQuery(".C_txt").text(C_Down_Cnt + "/" + C_Cnt);

								//영어
								let donut3c = 0;
								let donutTotalMinwon3 = ((E_Down_Cnt / E_Cnt) * 100);

								if(donutTotalMinwon3 > 99) {
									if(E_Down_Cnt != E_Cnt) {
										donutTotalMinwon3 = 99;
									}
								}

								const donutAnimation3 = setInterval(() => {
								  donut3.dataset.percent = donut3c
								  donut3.style.background = `conic-gradient(#5C0DC1 0 ${donut3c}%, #072369 ${donut3c}% 100% )`
								  donut3c++ >= donutTotalMinwon3 && clearInterval(donutAnimation3)
								}, 10);

								jQuery(".E_txt").text(E_Down_Cnt + "/" + E_Cnt);

								//수학
								let donut4c = 0;
								let donutTotalMinwon4 = ((D_Down_Cnt / D_Cnt) * 100);

								if(donutTotalMinwon4 > 99) {
									if(D_Down_Cnt != D_Cnt) {
										donutTotalMinwon4 = 99;
									}
								}

								const donutAnimation4 = setInterval(() => {
								  donut4.dataset.percent = donut4c
								  donut4.style.background = `conic-gradient(#D419E4 0 ${donut4c}%, #072369 ${donut4c}% 100% )`
								  donut4c++ >= donutTotalMinwon4 && clearInterval(donutAnimation4)
								}, 10);

								jQuery(".D_txt").text(D_Down_Cnt + "/" + D_Cnt);

								//중등 내신 최종점검
								let donut5c = 0;
								let donutTotalMinwon5 = ((B_Down_Cnt / B_Cnt) * 100);

								const donutAnimation5 = setInterval(() => {
								  donut5.dataset.percent = donut5c
								  donut5.style.background = `conic-gradient(#E419B7 0 ${donut5c}%, #072369 ${donut5c}% 100% )`
								  donut5c++ >= donutTotalMinwon5 && clearInterval(donutAnimation5)
								}, 10);

								jQuery(".B_txt").text(B_Down_Cnt + "/" + B_Cnt);
							}
						});
					}

                    break;
            }
        }
    });
}

// 보유 포인트 재설정 (포인트 관련 실시간 차감을 위해 사용하는 함수이나 지금 우선 빼놓은 상황 - DB에 영향을 너무 줘서)
function User_Point_Call() {
	jQuery.ajax({
		url: '/Include/User_Point_Call.asp',
		dataType: 'json',
		async: false,
		error: function(request, status, error){
			alert('서버통신 오류입니다.');
		},
		success: function(data){
			jQuery('#Gnb_ZP_Point_E').text('초등 ' + data.ZP_Point_E + ' P');
			jQuery('#Gnb_ZP_Point_M').text('중등 ' + data.ZP_Point_M + ' P');
			jQuery('#Gnb_ZP_Point_H').text('고등 ' + data.ZP_Point_H + ' P');
		}
	});
}

// 파일 다운
function Download_VOD_Zocbo(ExPapr_No, Exfl_Group, IsReDown, Down_No) {
    if (typeof (IsReDown) == 'undefined') IsReDown = '';
    if (typeof (Down_No) == 'undefined') Down_No = '';

    var kst = "N";
    if (document.getElementById("kst") != null) kst = document.getElementById("kst").value;

	VodPopup('6970681', '(1) 동물들은 모두가 서정시인', '대표유형', '1');

//    // 건수 차감 & 다운로드
//    jQuery.ajax({
//        url: "/Common/ExamDownload/DownloadComplete.asp",
//        async: false,
//        data: { ExPapr_No: ExPapr_No, Exfl_Group: Exfl_Group, DeviceType: _DeviceType, IsReDown: IsReDown, exDownNo: Down_No, Sitetype: _SiteType, kst: kst },
////        error: function() {
////            alert("오류가 발생하였습니다. 잠시후 다시 시도해주세요.");
////        },
//		error: function(request, status, error)
//		{
//			alert('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
//		},
//        success: function(data) {
//            switch (data) {
//                case '0': alert("로그인이 필요한 서비스입니다."); return; break;
//                case '1': alert("시험지 속성이 없습니다."); return; break;
//                case '2': alert("다운로드 권한이 없습니다."); return; break;
//                default:
//                    if (IsReDown == '') Down_No = data;
//                    // 다운로드
//                    var inputs = "<input type='hidden' name='ExPapr_No' value='" + ExPapr_No + "' /><input type='hidden' name='Exfl_Group' value='" + Exfl_Group + "' /><input type='hidden' name='DeviceType' value='" + _DeviceType + "' />"
//                               + "<input type='hidden' name='kst' value='" + kst + "' /><input type='hidden' name='IsReDown' value='" + IsReDown + "' /><input type='hidden' name='exDownNo' value='" + Down_No + "' />"
//                               + "<input type='hidden' name='Sitetype' value='" + _SiteType + "' />"
//                    jQuery("<form name='frmDownload' action='/Common/ExamDownload/DownloadAct.asp' method='get'>" + inputs + "</form>").appendTo("body").submit().remove();
//                    break;
//            }
//        }
//    });
}

// 파일 다운
function Download_VOD_Etoos(ExPapr_No, Exfl_Group, IsReDown, Down_No) {
    if (typeof (IsReDown) == 'undefined') IsReDown = '';
    if (typeof (Down_No) == 'undefined') Down_No = '';

    var kst = "N";
    if (document.getElementById("kst") != null) kst = document.getElementById("kst").value;

	VodPopup_Etoos('6970681', '(1) 동물들은 모두가 서정시인', '대표유형', '1');
}

// 다운로드 안내 레이어
function ExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, flag, Part_Id_Set, Part_Down_Seq) {
	if (typeof (Part_Id_Set) == 'undefined') Part_Id_Set = '';
	if (typeof (Part_Down_Seq) == 'undefined') Part_Down_Seq = '';
	let current_toggle = ($j("span#btn_toggle_c").parent("button").hasClass("teacher")) ? "T" : "C";
	let storageBoxViewCheck = isValueEmpty(GetCookie("appSync")) || current_toggle != "C" ? "N" : "Y";

    //var _url = "/Common/ExamDownload/DownloadConfirm_v1.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID + "&evt_free=" + _event_freedown + "&Part_Id_Set=" + Part_Id_Set;
	var _url = "/Common/ExamDownload/DownloadConfirm_v2.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID + "&evt_free=" + _event_freedown + "&Part_Id_Set=" + Part_Id_Set + "&Part_Down_Seq=" + Part_Down_Seq;

    if (jQuery(window).height() != jQuery(window.parent).height()) {
        // 중고등 메인 및 상세보기 추천컨텐츠는 iframe으로 되어있다.
        var _parent = jQuery(window.parent);
        var iHeight = ((_parent.height() - 470) / 2);
        var iWidth = ((_parent.width() - 450) / 2);
        var maskHeight = jQuery(window.parent.document).height();
        var maskWidth = _parent.width();

        jQuery("#levelTest", parent.document).css({ top: iHeight, left: iWidth }).show();
		if (storageBoxViewCheck != "N") {
			jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='610'>");
		} else {
			jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
		}
        jQuery('#mask', parent.document).css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);

    } else {
        var iHeight = ((jQuery(window).height() - 470) / 2);
        var iWidth = ((jQuery(window).width() - 450) / 2);
        var maskHeight = jQuery(document).height();
        var maskWidth = jQuery(window).width();

        jQuery("#levelTest").css({ top: iHeight, left: iWidth }).show();
		if (storageBoxViewCheck != "N") {
			jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='650'>");
		} else {
			jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='520'>");
		}
        jQuery('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
}

function ExamDownload_Confirm_V(ExPapr_No, Exfl_Group, SiteID, flag, Part_Id_Set, Part_Down_Seq, exam_Index) {
	if (typeof (Part_Id_Set) == 'undefined') Part_Id_Set = '';
	if (typeof (Part_Down_Seq) == 'undefined') Part_Down_Seq = '';
	if (typeof (exam_Index) == 'undefined') exam_Index = '';
	let current_toggle = ($j("span#btn_toggle_c").parent("button").hasClass("teacher")) ? "T" : "C";
	let storageBoxViewCheck = isValueEmpty(GetCookie("appSync")) || current_toggle != "C" ? "N" : "Y";

	var _url = "/Common/ExamDownload/DownloadConfirm_v2.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID + "&evt_free=" + _event_freedown + "&Part_Id_Set=" + Part_Id_Set + "&Part_Down_Seq=" + Part_Down_Seq + "&exam_Index=" + exam_Index;

    if (jQuery(window).height() != jQuery(window.parent).height()) {
        // 중고등 메인 및 상세보기 추천컨텐츠는 iframe으로 되어있다.
        var _parent = jQuery(window.parent);
        var iHeight = ((_parent.height() - 470) / 2);
        var iWidth = ((_parent.width() - 450) / 2);
        var maskHeight = jQuery(window.parent.document).height();
        var maskWidth = _parent.width();

        jQuery("#levelTest", parent.document).css({ top: iHeight, left: iWidth }).show();
		if (storageBoxViewCheck != "N") {
			jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='630'>");
		} else {
			jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='500'>");
		}
        jQuery('#mask', parent.document).css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);

    } else {
        var iHeight = ((jQuery(window).height() - 470) / 2);
        var iWidth = ((jQuery(window).width() - 450) / 2);
        var maskHeight = jQuery(document).height();
        var maskWidth = jQuery(window).width();

        jQuery("#levelTest").css({ top: iHeight, left: iWidth }).show();
		if (storageBoxViewCheck != "N") {
			jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='670'>");
		} else {
			jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='540'>");
		}
        jQuery('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
}

function ExamDownload_Confirm_V_Storage(ExPapr_No, Exfl_Group, SiteID, flag, Part_Id_Set, Part_Down_Seq, exam_Index) {
	if (typeof (Part_Id_Set) == 'undefined') Part_Id_Set = '';
	if (typeof (Part_Down_Seq) == 'undefined') Part_Down_Seq = '';
	if (typeof (exam_Index) == 'undefined') exam_Index = '';

	var _url = "/Common/ExamDownload/DownloadConfirm_storage.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID + "&evt_free=" + _event_freedown + "&Part_Id_Set=" + Part_Id_Set + "&Part_Down_Seq=" + Part_Down_Seq + "&exam_Index=" + exam_Index;

    if (jQuery(window).height() != jQuery(window.parent).height()) {
        // 중고등 메인 및 상세보기 추천컨텐츠는 iframe으로 되어있다.
        var _parent = jQuery(window.parent);
        var iHeight = ((_parent.height() - 470) / 2);
        var iWidth = ((_parent.width() - 450) / 2);
        var maskHeight = jQuery(window.parent.document).height();
        var maskWidth = _parent.width();

        jQuery("#levelTest", parent.document).css({ top: iHeight, left: iWidth }).show();
		jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='370'>");
        jQuery('#mask', parent.document).css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);

    } else {
        var iHeight = ((jQuery(window).height() - 470) / 2);
        var iWidth = ((jQuery(window).width() - 450) / 2);
        var maskHeight = jQuery(document).height();
        var maskWidth = jQuery(window).width();

        jQuery("#levelTest").css({ top: iHeight, left: iWidth }).show();
		jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='410'>");
        jQuery('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
	return false;
}

function TransformExamDownload_Confirm(ExPapr_No, Exfl_Group, SiteID, flag) {
    var _url = "/Common/ExamDownload/TransformDownloadConfirm.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID;

    if (jQuery(window).height() != jQuery(window.parent).height()) {
        // 중고등 메인 및 상세보기 추천컨텐츠는 iframe으로 되어있다.
        var _parent = jQuery(window.parent);
        var iHeight = ((_parent.height() - 470) / 2);
        var iWidth = ((_parent.width() - 450) / 2);
        var maskHeight = jQuery(window.parent.document).height();
        var maskWidth = _parent.width();

        jQuery("#levelTest", parent.document).css({ top: iHeight, left: iWidth }).show();
        jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
        jQuery('#mask', parent.document).css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);

    } else {
        var iHeight = ((jQuery(window).height() - 470) / 2);
        var iWidth = ((jQuery(window).width() - 450) / 2);
        var maskHeight = jQuery(document).height();
        var maskWidth = jQuery(window).width();

        jQuery("#levelTest").css({ top: iHeight, left: iWidth }).show();
        jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
        jQuery('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
}

function ExamDownload_Confirm_Tweezers_Zocbo(ExPapr_No, Exfl_Group, SiteID, flag)
{
    var _url = "/Common/ExamDownload/DownloadConfirm_Tweezers.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID;

    if (jQuery(window).height() != jQuery(window.parent).height())
	{
        // 중고등 메인 및 상세보기 추천컨텐츠는 iframe으로 되어있다.
        var _parent = jQuery(window.parent);
        var iHeight = ((_parent.height() - 470) / 2);
        var iWidth = ((_parent.width() - 450) / 2);
        var maskHeight = jQuery(window.parent.document).height();
        var maskWidth = _parent.width();

        jQuery("#levelTest", parent.document).css({ top: iHeight, left: iWidth }).show();
        jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
        jQuery('#mask', parent.document).css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
	else
	{
        var iHeight = ((jQuery(window).height() - 470) / 2);
        var iWidth = ((jQuery(window).width() - 450) / 2);
        var maskHeight = jQuery(document).height();
        var maskWidth = jQuery(window).width();

        jQuery("#levelTest").css({ top: iHeight, left: iWidth }).show();
        jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
        jQuery('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
}

function ExamDownload_Confirm_Tweezers_Etoos(ExPapr_No, Exfl_Group, SiteID, flag)
{
    var _url = "/Common/ExamDownload/DownloadConfirm_Tweezers_Etoos.asp?ExPapr_No=" + ExPapr_No + "&Exfl_Group=" + Exfl_Group + "&flag=" + flag + "&SiteID=" + SiteID;

    if (jQuery(window).height() != jQuery(window.parent).height())
	{
        // 중고등 메인 및 상세보기 추천컨텐츠는 iframe으로 되어있다.
        var _parent = jQuery(window.parent);
        var iHeight = ((_parent.height() - 470) / 2);
        var iWidth = ((_parent.width() - 450) / 2);
        var maskHeight = jQuery(window.parent.document).height();
        var maskWidth = _parent.width();

        jQuery("#levelTest", parent.document).css({ top: iHeight, left: iWidth }).show();
        jQuery("#gameplayer", parent.document).append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
        jQuery('#mask', parent.document).css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
	else
	{
        var iHeight = ((jQuery(window).height() - 470) / 2);
        var iWidth = ((jQuery(window).width() - 450) / 2);
        var maskHeight = jQuery(document).height();
        var maskWidth = jQuery(window).width();

        jQuery("#levelTest").css({ top: iHeight, left: iWidth }).show();
        jQuery("#gameplayer").append("<iframe src=" + _url + " frameBorder='0' scrolling='no' width='450' height='480'>");
        jQuery('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeTo("slow", 0.2);
    }
}

function fnCheck(value, ExPapr_No, Exfl_Group, Part_Down_Seq, exam_Index) {
	if (typeof (Part_Down_Seq) == 'undefined') Part_Down_Seq = '';
	if (typeof (exam_Index) == 'undefined') exam_Index = '';

    jQuery('#fadeB, a.close').remove();
    jQuery('#gameplayer').empty();
    jQuery('#mask, .window').hide();

    if (value == 1) {
		Download(ExPapr_No, Exfl_Group, '', '', Part_Down_Seq, exam_Index);
    }
	else if (value == 3) {
		Download(ExPapr_No, Exfl_Group, '', 'viewer', '', exam_Index);
    }

	// 다운받는 파일과 회원정보가 일치하는지 확인
	if(window.opener == null) {
		MemberInfoPopupCtrl.member_info_popup_init({"type":"D", "expapr_no":"" + ExPapr_No + ""});
	}
}

function fnCheck_storage(value, ExPapr_No, Exfl_Group, Part_Down_Seq, exam_Index, ExPaPr_Group, ExPapr_CoreType, Ref_Pay_Svc) {
	
	if (typeof (Part_Down_Seq) == 'undefined') Part_Down_Seq = '';
	if (typeof (exam_Index) == 'undefined') exam_Index = '';

	let trk_params = {"param1" : ExPapr_No, "param2" : ExPaPr_Group, "param3" : ExPapr_CoreType, "param4" : Ref_Pay_Svc };
	trkCLS.setExternalEvent("KJ825TLH9KA4I69VR2KPN4TJD20241107", trk_params);

    jQuery('#fadeB, a.close').remove();
    jQuery('#gameplayer').empty();
    jQuery('#mask, .window').hide();

    if (value == 1) {
		Download(ExPapr_No, Exfl_Group, '', '', Part_Down_Seq, exam_Index);
    }
	else if (value == 3) {
		Download(ExPapr_No, Exfl_Group, '', 'viewer', '', exam_Index);
    }

	// 다운받는 파일과 회원정보가 일치하는지 확인
	if(window.opener == null) {
		MemberInfoPopupCtrl.member_info_popup_init({"type":"D", "expapr_no":"" + ExPapr_No + ""});
	}
}

function PrefnCheck(Siteid, Grade, Subj_Code, mSubj_Code, PreTerm, Part_ID_Set, PubName) {
	//idx
	//H1KR01Q
	if (PreTerm == "20232E" || PreTerm == "20241M" || PreTerm == "20241E") {
		(GetCookie("download-rnpay") != "download-rnpay") ? $j("#download-rnpay").show() : '';

		var pre_siteid;

		if(Siteid == "H")
		{
			pre_siteid = "고등";
			$j("#pre_a_link").prop("href", "/ZocboSettlement/rnpay2.asp");
			$j("#pre_a_link").text("건당 158 원에 사용 가능한 이용권 자세히 보기 >");
		}
		else
		{
			pre_siteid = "중등";
		}

		$j("#pre_down_grade").text(pre_siteid + " " + Grade + "학년 이용권으로");
	}
	location.href = "/common/examdownload/SampleDownloadS3.asp?strGubun=pretest&idx="+Siteid+Grade+Subj_Code+"01Q&PreTerm="+PreTerm+"&PubName="+PubName+"&Part_ID_Set="+Part_ID_Set+"&mSubj_Code="+mSubj_Code;
	
}

function prefnCheck_new(Siteid, Grade, Subj_Code, mSubj_Code, PreTerm, Part_ID_Set, PubName, Save_Filetitle) {
	location.href = "/common/examdownload/SampleDownloadS3.asp?strGubun=pretest&idx="+Siteid+Grade+Subj_Code+"01Q&PreTerm="+PreTerm+"&PubName="+PubName+"&Part_ID_Set="+Part_ID_Set+"&mSubj_Code="+mSubj_Code+"&save_filetitle="+Save_Filetitle;
}

function fnCheck_VOD_Zocbo(value, ExPapr_No, Exfl_Group) {
    jQuery('#fadeB, a.close').remove();
    jQuery('#gameplayer').empty();
    jQuery('#mask, .window').hide();
    if (value == 1) {
        Download_VOD_Zocbo(ExPapr_No, Exfl_Group);
    }
}

function fnCheck_VOD_Etoos(value, ExPapr_No, Exfl_Group) {
    jQuery('#fadeB, a.close').remove();
    jQuery('#gameplayer').empty();
    jQuery('#mask, .window').hide();
    if (value == 1) {
        Download_VOD_Etoos(ExPapr_No, Exfl_Group);
    }
}

function RefnCheck(value, ExPapr_No, Exfl_Group, Re_DownNo) {
	if (typeof (Part_Id_Set) == 'undefined') Part_Id_Set = '';
    jQuery('#fadeB, a.close').remove();
    jQuery('#gameplayer').empty();
    jQuery('#mask, .window').hide();

    if (value == 1) {
        ExamDownload_ReDown(ExPapr_No, Exfl_Group, Re_DownNo);
    }

	// 다운받는 파일과 회원정보가 일치하는지 확인
	if(window.opener == null) {
		MemberInfoPopupCtrl.member_info_popup_init({"type":"D", "expapr_no":"" + ExPapr_No + ""});
	}
}


// 빠른족보 파일 다운로드
function ExamDownloadQuick_20191E(ExPapr_No, Exfl_Group, SiteID, ExPapr_Group, IsAutoExamDown, Subj_Code, Grade, exPapr_Coretype)
{
	alert('이벤트가 종료되었습니다.');
}

// 빠른족보 파일 다운로드
function fn_examDownloadQuickCommon(exPapr_No, exfl_Group, siteID, exPapr_Group, isAutoExamDown, subj_Code, grade, exPapr_Coretype, terms)
{
	if (typeof (terms) == 'undefined') terms = '';

	if (terms == '20212M')
	{
		if (typeof (exPapr_Group) == 'undefined') exPapr_Group = '';
		if (typeof (isAutoExamDown) == 'undefined') isAutoExamDown = false;
		if (typeof (subj_Code) == 'undefined') subj_Code = '';
		if (typeof (grade) == 'undefined') grade = '';
		if (typeof (exPapr_Coretype) == 'undefined') exPapr_Coretype = '';

		var isChk_History = false;

		_ExPapr_No  = exPapr_No;
		_Exfl_Group = exfl_Group;
		_SiteID     = siteID;

		if (!Download_Check(exPapr_No, exfl_Group))										// 로그인 및 권한 체크
		{
			return;
		}

		if (exPapr_Group == 'V' && isAutoExamDown == false)
		{
			Download_AutoExam(exPapr_No);
		} else {
			if (isChk_History) {
				if (!DownloadHistory_Check(exPapr_No, exfl_Group, siteID))				// 다운로드 기록 체크
				{
					return;
				}
			}

			Download(exPapr_No, exfl_Group);											// 다운로드 안내 레이어
		}
	}
	else
	{
		alert('이벤트가 종료되었습니다.');
	}
}



jQuery(function() {
    if (jQuery(window).height() == jQuery(window.parent).height()) {
        var htm = "<link rel=\"stylesheet\" type=\"text/css\" href=\"/Common/Css/PopUpLayer.css\" />"
        + "<script type=\"text/javascript\" src=\"/Common/js/PopUpLayer.js\"></script>"
        + "<div id=\"mask\"></div>"
        + "<div id=\"levelTest\" class=\"modalwindow game\" style=\"display:none\">"
        + "    <div id=\"gameplayer\"></div>"
        + "</div>"
        jQuery('body').append(htm);
    }
});

function pop_Open(ExPapr_No, zUser_ID)
{
	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
		return;
	}
	else
	{
		window.open('/include/pdf_Viewer.asp?ExPapr_No='+ExPapr_No+'&pop=Y', 'Scan Preview', 'top=10, left=10, width=850, height=1100, status=no, menubar=no, toolbar=no, resizable=no');
	}		
}

function link_FreeReading(SiteID, zUser_ID, ExPapr_No, rg_CitiesProvinces, rg_District, scl_ID, Grade, expapr_TestYear, expapr_Term, expapr_MidEnd, Subj_Code, TX_CODE, Price)
{
	var url = "";

	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
		return;
	}
	else
	{
		if(SiteID == "M")
		{
			url = "/ZocboMid/ZocboExamSchool/";
		}
		else
		{
			url = "/ZocboHigh/ZocboExamSchool/";
		}
		
		window.open(url + 'Previous_FreeReading.asp?ExPapr_No='+ExPapr_No+'&Rg_CitiesProvinces='+rg_CitiesProvinces+'&Rg_District='+rg_District+'&Scl_ID='+scl_ID+'&Grade='+Grade+'&ExPapr_TestYear='+expapr_TestYear+'&ExPapr_MidEndTerm='+(expapr_Term+expapr_MidEnd)+'&Subj_Code='+Subj_Code+'&TX_CODE='+TX_CODE+'&isSearch=Y');
	}
}

function link_FreeReading_Popup(SiteID, zUser_ID, ExPapr_No, rg_CitiesProvinces, rg_District, scl_ID, Grade, expapr_TestYear, expapr_Term, expapr_MidEnd, Subj_Code, TX_CODE, Price)
{
	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
		return;
	}
	else
	{
		//opener.window.open('/PDFVIEWER/WEB/viewer.asp?ExPapr_No='+ExPapr_No+'&Rg_CitiesProvinces='+rg_CitiesProvinces+'&Rg_District='+rg_District+'&Scl_ID='+scl_ID+'&Grade='+Grade+'&ExPapr_TestYear='+expapr_TestYear+'&ExPapr_MidEndTerm='+(expapr_Term+expapr_MidEnd)+'&Subj_Code='+Subj_Code+'&TX_CODE='+TX_CODE+'&isSearch=Y&viewer=Y');
		opener.window.open('/Include/recaptcha_Chk.asp?ExPapr_No='+ExPapr_No+'&Rg_CitiesProvinces='+rg_CitiesProvinces+'&Rg_District='+rg_District+'&Scl_ID='+scl_ID+'&Grade='+Grade+'&ExPapr_TestYear='+expapr_TestYear+'&ExPapr_MidEndTerm='+(expapr_Term+expapr_MidEnd)+'&Subj_Code='+Subj_Code+'&TX_CODE='+TX_CODE+'&isSearch=Y&viewer=Y');
	}
}

function link_FreeReading_V2(SiteID, zUser_ID, ExPapr_No, rg_CitiesProvinces, rg_District, scl_ID, Grade, expapr_TestYear, expapr_Term, expapr_MidEnd, Subj_Code, TX_CODE, Price)
{
	if(zUser_ID == '')
	{
		layerOpen('loginpopname');
		return;
	}
	else
	{
		//window.open('/PDFVIEWER/WEB/viewer.asp?ExPapr_No='+ExPapr_No+'&Rg_CitiesProvinces='+rg_CitiesProvinces+'&Rg_District='+rg_District+'&Scl_ID='+scl_ID+'&Grade='+Grade+'&ExPapr_TestYear='+expapr_TestYear+'&ExPapr_MidEndTerm='+(expapr_Term+expapr_MidEnd)+'&Subj_Code='+Subj_Code+'&TX_CODE='+TX_CODE+'&isSearch=Y&viewer=Y');
		window.open('/Include/recaptcha_Chk.asp?ExPapr_No='+ExPapr_No+'&Rg_CitiesProvinces='+rg_CitiesProvinces+'&Rg_District='+rg_District+'&Scl_ID='+scl_ID+'&Grade='+Grade+'&ExPapr_TestYear='+expapr_TestYear+'&ExPapr_MidEndTerm='+(expapr_Term+expapr_MidEnd)+'&Subj_Code='+Subj_Code+'&TX_CODE='+TX_CODE+'&isSearch=Y&viewer=Y&freeView=Y');
	}
}

/* 편집제공되는 다운로드 팝업창 트래킹 추적 */
function DownLoadCompleteTrack(exPaprNo, exflGroup) {	
	let trackCd = exflGroup == 4 ? "V7F4PAMPCOLE5DWJPER2QR6O720240906" : "WY5BYXI3WWFWHG2ADP5MZKBE720240906";
	let tparams = {"param1" : exPaprNo, "param2" : exflGroup};
	trkCLS.setExternalEvent(trackCd, tparams);
}

/* 편집제공되는 다운로드 팝업창 편집하기 이용권 차감 트래킹 추적 */
function cloudEditCompleteTrack(AuthType, contentType, gubun) {	
	let trackCd = "WVMAU47G1PT1MEFCT22JHAPIQ20240912";
	let tparams = {"param1" : AuthType};

	if (contentType == "CLOUD_EDIT") {
		if (gubun == "1") {
			trackCd = "EX8KTFPYAO48MWAHEVOBFOPZE20240813";	
		} else {
			trackCd = "2MRKZ191Y62WT8L4V855PNBRQ20240813";
		}
	} 

	trkCLS.setExternalEvent(trackCd, tparams);
}
