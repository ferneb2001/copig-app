*:*********************************************************************
*:
*: Procedure file: C:\PRO20\PDRIVERS\GEN_PD.PRG
*:
*:         System: FoxPro Printer Driver Application
*:         Author: MCP
*:      Copyright (c) 1991, Fox Holdings, Inc.
*:  Last modified: 07/09/91      9:25
*:
*:  Procs & Fncts: USERESO
*:               : SETPDRIVER
*:               : CLEANUP
*:               : LOCATEPD()
*:               : ALRT
*:               : RESTORE_DATA
*:
*:          Calls: USERESO            (procedure in GEN_PD.PRG)
*:               : SETPDRIVER         (procedure in GEN_PD.PRG)
*:               : CLEANUP            (procedure in GEN_PD.PRG)
*:               : LOCATEPD()         (function  in GEN_PD.PRG)
*:               : PD_SETUP.SPR
*:               : ALRT               (procedure in GEN_PD.PRG)
*:               : PD_EDIT.SPR
*:
*:   Memory Files: MEMO.MEM
*:
*:      Documented 07/09/91 at 09:27               FoxDoc  version 2.10
*:*********************************************************************
*
* _pdparms Element Layout
*

*  Element		Non-Postcript Printer 						Postscript

*	1			Printer Name								Portrait Orientation (.T.)
*	2			Port										Number of Copies
*	3			Setup										Scaled Font Size
*	4			Reset										Spacing Factor (leading)
*	5			Form Length									Italic (.T.)
*	6			Form Feed									Bold (.T.)
*	7			Lines per Inch								Top Margin
*	8			Characters per Inch							Document Width / Width Scaling Factor
*	9			Compressed 									Document Length / Length Scaling Factor
*	10			Orientation (Portrait/Landscape)			Bottom Margin
*	11			Bold On										Left Margin
*	12			Bold off									Font Name
*	13			Underline On								Bold Font
*	14			Underline Off								Italic Font
*	15			Italic On									Font Separator
*	16			Italic Off									Regular Font
*	17			Superscript On								Document height
*	18			Superscript Off								Full Normal Font Name
*	19			Subscript On								Scaled Superscript Size
*	20			Subscript Off								Scaled Subscript Size
*	21			Object Printed on Current Page?				Actual Font Size
*	22			New Line									Superscript Size
*	23			Horizontal Move Command-1					Subscript Size
*	24			Horizontal Move Command-2					PDdocst User Procedure
*	25			Global Style (Normal/Italic)				PDpagest User Procedure
*	26			Global Stroke (Medium/Bold)					PDlinest User Procedure
*	27			Line Number									PDobjectst User Procedure
*	28			Document Height								PDobject User Procedure
*	29			Document Width								PDobjectend User Procedure
*	30			PDdocst User Procedure						PDlineend User Procedure
*	31			PDpagest User Procedure						PDpageend User Procedure
*	32			PDlinest User Procedure						PDdocend User Procedure
*	33			PDobjectst User Procedure					Object Counter
*	34			PDobject User Procedure						Numeric Scaled Font Size
*	35			PDobjectend User Procedure					Not Used
*	36			PDlineend User Procedure					Horizontal Points on Page
*	37			PDpageend User Procedure					Vertical Points on Page
*	38			PDdocend User Procedure						Include Regular Font Name with Italic
*	39			Internal Flag
*	40			Top Margin Command
*	41			Top Margin in lines
*	42			Capture Buffer
*



PARAMETERS m.callagain, m.setupname

PRIVATE m.g_foxuser, m.talk, m.fox, m.deleted, m.workarea, ;
		m.g_pddriver, m.g_pdorientation, m.g_pdstyle, m.g_pdstroke, m.g_pdleading, ;
		m.g_pdcpi, m.g_pdlpi, m.g_pdfontsize, m.g_pdfont, m.g_pdtmargin, ;
		m.g_pdlmargin, m.g_pdname, m.g_saved, m.found, m.g_action, m.g_pdpgsize, ;
		m.chg_flag, m.g_pdprocs, m.save_setup, m.trbetween, m.escape, m.none, m.exact, ;
		m.readonly, m.memofield, m.tempfile


IF SET("TALK") = "ON"
	SET TALK OFF
	m.talk = .T.
ELSE
	m.talk = .F.
ENDIF


IF SET("ESCAPE") = "ON"
	m.escape = .T.
	SET ESCAPE OFF
ELSE
	m.escape = .F.
ENDIF


IF SET("DELETED") = "ON"
	m.deleted = .T.
ELSE
	m.deleted = .F.
	SET DELETED ON
ENDIF

m.trbetween = SET("TRBET")
SET TRBET OFF

IF SET("EXACT") = "ON"
	m.exact = .T.
ELSE
	m.exact = .F.
	SET EXACT ON
ENDIF

STORE "" TO m.g_foxuser, m.fox
STORE .F. TO m.readonly
m.workarea = SELECT()

*
* Check the number of parameters were passed.  If there were none, then
* set the printer driver up with the default printer driver if there is one.
*

IF PARAMETERS() = 0

	DO usereso
	IF NOT EMPTY(m.g_foxuser)

		LOCATE FOR type = "DATA2.0" AND id = "PDSETUP" ;
			AND LEFT(name, 1) = "-"

		IF FOUND()

			IF ckval = VAL(SYS(2007, data)) AND ;
					SUBSTR(data,1,2) = CHR(0) + CHR(2)

				IF m.readonly
					m.tempfile = SYS(2023) + SYS(3)
					m.memofield = SUBSTR(data,3)		&& Get rid of version number.
					COPY STRUCTURE TO (m.tempfile) FIELDS data
					SELECT 0
					USE (m.tempfile)
					APPEND BLANK
					REPLACE data WITH m.memofield
					RESTORE FROM MEMO data ADDITIVE
					USE
					SELECT (m.g_foxuser)
					DELETE FILE (m.tempfile + ".DBF")
					DELETE FILE (m.tempfile + ".FPT")
				ELSE
					REPLACE data WITH SUBSTR(data,3)		&& Get rid of version number.
					RESTORE FROM MEMO data ADDITIVE
					REPLACE data WITH CHR(0) + CHR(2) + data
				ENDIF

				DO setpdriver

			ENDIF

		ENDIF

	ENDIF

	DO cleanup
	RETURN

ENDIF



PUSH KEY
STORE .F. TO m.found


*
* Initialization of the screen variables
*
DIMENSION g_pdfiles[9], g_pdchkbox[9]

m.g_action = 5
g_pdfiles = ""
g_pdchkbox = 0
m.g_pddriver = ""
m.g_pdorientation = 1
m.g_pdstyle = 1
m.g_pdstroke = 1
m.g_pdcpi = 1
m.g_pdlpi = 1
m.g_pdfontsize = "10.0"
m.g_pdfont = "Times"
m.g_pdtmargin = 2				&& In Lines
m.g_pdlmargin = 15				&& In Points
m.g_pdleading = 0.80
m.g_pdname = IIF((m.setupname = "?") OR (m.callagain = 2), "", m.setupname)
m.chg_flag = .F.
m.g_pdpgsize = 1
m.g_pdprocs = 0
m.none = .F.

DO usereso

IF (NOT EMPTY(m.g_foxuser) AND NOT locatepd()) OR m.callagain = 2

	IF NOT EMPTY(_PDSETUP) AND (EMPTY(m.setupname) OR m.setupname = "?")
		m.setupname = _PDSETUP
		m.none = .T.
	ELSE
		IF m.callagain != 2 OR EMPTY(m.setupname)
			m.setupname = "<None>"
		ENDIF
	ENDIF

	IF NOT EMPTY(m.g_foxuser)
		m.save_setup = m.setupname
		DO pd_setup.spr
		IF (m.g_action = 5) OR (ALLTRIM(m.setupname) = "<None>") OR ;
				(NOT m.found)
			IF ALLTRIM(m.save_setup) = "<None>" OR ;
				(ALLTRIM(m.setupname) = "<None>" AND m.g_action != 5) OR m.none
				m.save_setup = ""
			ENDIF
			DO cleanup
			RETURN m.save_setup
		ENDIF
	ELSE
		IF m.callagain = 2
			DO alrt WITH "Resource file is unavaliable."
			m.g_saved = 1
		ELSE

			m.g_saved = 1
			DO pd_edit.spr
		ENDIF
		IF m.g_saved = 1
			DO cleanup
			RETURN
		ENDIF
	ENDIF

ELSE


	*
	* If there isn't a foxuser file active, then bring up the dialog
	* to Create a Setup.
	*

	m.g_saved = 2
	IF EMPTY(m.g_foxuser)
		m.chg_flag = .T.
		DO pd_edit.spr
	ENDIF

	IF 	m.g_saved = 1 AND NOT m.found
		DO cleanup
		RETURN
	ENDIF

ENDIF

IF m.callagain != 2
	DO setpdriver
ENDIF
DO cleanup

RETURN m.g_pdname





*!*********************************************************************
*!
*!       Function: LOCATEPD()
*!
*!      Called by: GEN_PD.PRG                        
*!               : SETPD()            (function  in PD_SETUP.SPR)
*!               : M.g_action valid() (function  in PD_SETUP.SPR)
*!
*!          Calls: RESTORE_DATA       (procedure in GEN_PD.PRG)
*!               : ALRT               (procedure in GEN_PD.PRG)
*!
*!   Memory Files: MEMO.MEM
*!
*!*********************************************************************
PROCEDURE locatepd

	m.found = .F.
	SELECT (m.g_foxuser)
	LOCATE FOR type = "DATA2.0" AND id = "PDSETUP"
	IF FOUND()

		m.found = .T.
		DO WHILE m.found
*
* Restore if it is found, Locate another otherwise.
*
			IF ALLTRIM(UPPER(name)) == ALLTRIM(UPPER(m.setupname)) OR ;
				ALLTRIM(UPPER(SUBSTR(name,2))) == ALLTRIM(UPPER(m.setupname))

				IF ckval = VAL(SYS(2007, data)) AND ;
						SUBSTR(data,1,2) = CHR(0) + CHR(2)

					IF m.readonly
						DO restore_data
					ELSE
						REPLACE data WITH SUBSTR(data,3)		&& Get rid of version number.
						RESTORE FROM MEMO data ADDITIVE
						REPLACE data WITH CHR(0) + CHR(2) + data
					ENDIF

					EXIT
				ELSE
					DO alrt WITH "Corrupted setup or incorrect version."
					m.found = .F.
				ENDIF

			ELSE
				CONTINUE
				IF NOT FOUND()
					m.found = .F.
				ENDIF
			ENDIF
		ENDDO

	ENDIF

RETURN m.found


*!*********************************************************************
*!
*!      Procedure: USERESO
*!
*!      Called by: GEN_PD.PRG                        
*!
*!*********************************************************************
PROCEDURE usereso
PRIVATE attribs

	IF SET("RESOURCE") = "ON"		&& Check to see if the resource is active.

		m.fox = SYS(2005)
		m.g_foxuser = SYS(2015)
		SELECT 0
		=ADIR(attribs, m.fox)
		IF LEFT(attribs[1,5],1) = "R"
			m.readonly = .T.
		ENDIF
		USE (m.fox) AGAIN ALIAS (m.g_foxuser)


	ENDIF

RETURN


*!*********************************************************************
*!
*!      Procedure: RESTORE_DATA
*!
*!      Called by: LOCATEPD()         (function  in GEN_PD.PRG)
*!
*!   Memory Files: MEMO.MEM
*!
*!*********************************************************************
PROCEDURE restore_data
PRIVATE m.tempfile, m.memofield

	m.tempfile = SYS(2023) + SYS(3)
	m.memofield = SUBSTR(data,3)		&& Get rid of version number.
	COPY STRUCTURE TO (m.tempfile) FIELDS data
	SELECT 0
	USE (m.tempfile)
	APPEND BLANK
	REPLACE data WITH m.memofield
	RESTORE FROM MEMO data ADDITIVE
	USE
	SELECT (m.g_foxuser)
	DELETE FILE (m.tempfile + ".DBF")
	DELETE FILE (m.tempfile + ".FPT")

RETURN



*!*********************************************************************
*!
*!      Procedure: SETPDRIVER
*!
*!      Called by: GEN_PD.PRG                        
*!
*!          Calls: ALRT               (procedure in GEN_PD.PRG)
*!
*!           Uses: FONTS.DBF          
*!               : P_CODES.DBF        
*!
*!      CDX files: FONTS.CDX
*!               : P_CODES.CDX
*!
*!*********************************************************************
PROCEDURE setpdriver
PRIVATE m.first, m.char, m.horizpts, m.vertpts, m.i, m.second, m.select, ;
		m.string

	*
	* At this point, the variables which will populate _pdparms should
	* be setup.
	*

	_PDRIVER = ""			&& Release any active printer driver.

	IF m.g_pddriver = "Postscript"


		PUBLIC _pdparms[39]


		_pdparms[2] = "1"
		_pdparms[3] = "1"				&& Scaled Font Size
		_pdparms[4] = m.g_pdleading		&& Spacing Factor (leading)
		_pdparms[5] = m.g_pdstyle
		_pdparms[6] = m.g_pdstroke
		_pdparms[7] = m.g_pdtmargin
		_pdparms[8] = "80"			&& Document Width
		_pdparms[9] = 66			&& Document Length
		_pdparms[10] = 2			&& Bottom Margin
		_pdparms[11] = m.g_pdlmargin
		_pdparms[21] = m.g_pdfontsize
		_pdparms[33] = 0			&& Object length counter
		_pdparms[34] = VAL("1")		&& Numeric Scaled Font Size

*
* Check what size paper and assign appropriate values.
*

		DO CASE
		CASE m.g_pdpgsize = 1
			m.horizpts = 612
			m.vertpts = 792

		CASE m.g_pdpgsize = 2
			m.horizpts = 612
			m.vertpts = 1008

		CASE m.g_pdpgsize = 3
			m.horizpts = 595
			m.vertpts = 839

		ENDCASE

*
* Set up for Landscape or Portrait Orientation.
*
		IF m.g_pdorientation = 1
			_pdparms[1] = .T.
			_pdparms[36] = m.horizpts
			_pdparms[37] = m.vertpts
		ELSE
			_pdparms[1] = .F.
			_pdparms[36] = m.vertpts
			_pdparms[37] = m.horizpts
		ENDIF



		SELECT 0
		USE fonts AGAIN
		LOCATE FOR ALLTRIM(m.g_pdfont) == ALLTRIM(fonts.fontname)

		IF FOUND()
			_pdparms[12] = "/" + ALLTRIM(fonts.fontname)
			_pdparms[13] = ALLTRIM(fonts.bold)
			_pdparms[14] = ALLTRIM(fonts.italic)
			_pdparms[15] = ALLTRIM(fonts.separator)
			_pdparms[16] = ALLTRIM(fonts.regular)
			_pdparms[38] = fonts.incl_reg
			_pdparms[18] = _pdparms[12]

			IF EMPTY(_pdparms[13]) AND EMPTY(_pdparms[14]) OR ;
				(_pdparms[5] = 1 AND _pdparms[6] = 1)
				IF NOT EMPTY(_pdparms[16])
					_pdparms[18] = _pdparms[18]  + _pdparms[15] + _pdparms[16]
				ENDIF
			ELSE
				
				IF (_pdparms[6] = 2)				&& Bold

					_pdparms[18] = _pdparms[18]  + _pdparms[15] + _pdparms[13]
					IF _pdparms[5] = 2				&& Bold and Italic
						_pdparms[18] = _pdparms[18]  + _pdparms[15] + _pdparms[13]
					ENDIF
					
				ELSE
					IF _pdparms[5] = 2
						IF _pdparms[38]				&& Italic include Normal
							_pdparms[18] = _pdparms[18]  + _pdparms[15] + _pdparms[16] + _pdparms[14]
						ELSE						&& Italic do not include Normal
							_pdparms[18] = _pdparms[18]  + _pdparms[15] + _pdparms[14]
						ENDIF
					ENDIF
				ENDIF
			
*			_pdparms[18] = _pdparms[12] + IIF(_pdparms[6]=2 OR _pdparms[5]=2 OR NOT EMPTY(_pdparms[16]), ;
*				_pdparms[15], _pdparms[16]) + IIF((NOT EMPTY(_pdparms[16]) AND ;
*				(_pdparms[6] = 1 OR (_pdparms[38] AND _pdparms[5] = 2))), _pdparms[16], "") + ;
*				IIF(_pdparms[6] = 2,_pdparms[13],"") + ;
*				IIF(_pdparms[5] = 2, _pdparms[14],"")
			ENDIF
		ELSE
			_pdparms[12] = "/Times"
			_pdparms[13] = "Bold"
			_pdparms[14] = "Italic"
			_pdparms[15] = "-"
			_pdparms[16] = "Roman"
			_pdparms[38] = .F.
		ENDIF

		USE


		_pdparms[17] = _pdparms[36] / 80
		_pdparms[22] = VAL(_pdparms[21]) * .5
		_pdparms[23] = _pdparms[22] * .5
		_pdparms[19] = ALLTRIM(STR(_pdparms[22]))
		_pdparms[20] = ALLTRIM(STR(_pdparms[23]))

		=ACOPY(g_pdfiles, _pdparms, 1, 9, 24)

		_pdparms[39] = 0
*
* If you would like to use the XBase version of the printer drivers,
* uncomment the line below

* 		_PDRIVER = "PS.PRG"


* and make the line below a comment.
		_PDRIVER = "PSAPI.PLB"


	ELSE		&& The printer driver is for a character based printer.


		PUBLIC _pdparms[43]
		_pdparms[42] = ""

		SELECT 0
		m.select = SELECT()
		USE p_codes AGAIN
		LOCATE FOR p_name == m.g_pddriver
		IF FOUND()

			SCATTER FIELDS p_name, p_outport, p_setup, p_reset, ;
					p_flen, p_ff, (IIF(m.g_pdlpi = 1, "p_6lpi", "p_8lpi")), ;
					p_10cpi, p_compress, ;
					(IIF(m.g_pdorientation = 1,"p_portrait", "p_landscap")), ;
					p_boldon, p_boldoff, p_ulineon, p_ulineoff, p_italon, ;
					p_italoff, p_superon, p_superoff, p_subon, p_suboff, ;
					p_fixed, p_crlf, p_horzmv1, p_horzmv2 ;
					TO _pdparms
			DO CASE
				CASE g_pdcpi = 1
					_pdparms[8] = p_10cpi
				CASE g_pdcpi = 2
					_pdparms[8] = p_12cpi
				CASE g_pdcpi = 3
					_pdparms[8] = p_compress
			ENDCASE

			m.first = AT("{#",p_topmarg)
			IF m.first > 0
				_pdparms[40] = LEFT(p_topmarg,m.first-1) + ;
					ALLTRIM(STR(m.g_pdtmargin)) + ALLTRIM(SUBSTR(p_topmarg, m.first+3))
			ELSE
				_pdparms[40] = ""
			ENDIF
			_pdparms[41] = m.g_pdtmargin


		ENDIF

		USE
		SELECT (m.select)


	*
	* Format the codes in the array (removing trailing blanks and checking
	* for embeded nulls, carriage returns, and line feeds.)
	*
		FOR m.i = 1 to 24
			_pdparms[m.i] = ALLTRIM(_pdparms[m.i])
			m.first = AT("{",_pdparms[m.i])
			DO WHILE m.first > 0
				m.second = AT("}",_pdparms[m.i])
				m.string = SUBSTR(_pdparms[m.i], m.first + 1, m.second-m.first-1)
				DO CASE
					CASE m.string = "NULL"
						m.char = CHR(0)
					CASE m.string = "CR"
						m.char = CHR(13)
					CASE m.string = "LF"
						m.char = CHR(10)
					OTHERWISE
						m.first = 0

				ENDCASE
				IF m.first > 0
					_pdparms[m.i] = SUBSTR(_pdparms[m.i], 1, first-1) + m.char + ;
						SUBSTR(_pdparms[m.i],second+1)
					m.first = AT("{",_pdparms[m.i])
				ENDIF
			ENDDO

		ENDFOR

	*
	* Set up the codes for Bold and Italic.  Reset the line counter.
	*

		_pdparms[25] = IIF(m.g_pdstyle = 1, _pdparms[16], _pdparms[15])
		_pdparms[26] = IIF(m.g_pdstroke = 1, _pdparms[12], _pdparms[11])
		_pdparms[27] = 1

		=ACOPY(g_pdfiles, _pdparms, 1, 9, 30)
		_pdparms[39] = .F.
		_pdparms[43] = 0

*
* If you would like to use the XBase version of the printer drivers,
* uncomment the line below
* 		_PDRIVER = "DRIVER.PRG"


* and make the line below a comment.
		_PDRIVER = "DRIVER2.PLB"


	ENDIF

	IF TYPE("_pdparms") != "N" OR (TYPE("_pdparms") = "N" AND _pdparms != -1)
		_PDSETUP = "-" + ALLTRIM(m.g_pdname)
	ELSE
		DO alrt WITH "Unable to install printer driver."
	ENDIF

RETURN



*!*********************************************************************
*!
*!      Procedure: ALRT
*!
*!      Called by: GEN_PD.PRG                        
*!               : SETPDRIVER         (procedure in GEN_PD.PRG)
*!               : LOCATEPD()         (function  in GEN_PD.PRG)
*!               : M.g_saved valid()  (function  in PD_EDIT.SPR)
*!
*!*********************************************************************
PROCEDURE alrt
PARAMETER m.message
PRIVATE m.remove


	DEFINE WINDOW _pvz0lhvmg ;
		FROM INT((SROW()-7)/2),INT((SCOL()-50)/2) ;
		TO INT((SROW()-7)/2)+6,INT((SCOL()-50)/2)+49 ;
		FLOAT ;
		NOCLOSE ;
		SHADOW ;
		DOUBLE ;
		COLOR SCHEME 7

	ACTIVATE WINDOW _pvz0lhvmg

	m.remove = 1

	@ 1,0 SAY PADC(m.message, 48, " ")
	@ 4,17 GET m.remove ;
		PICTURE "@*HT \!\<OK" ;
		SIZE 1,12,10 ;
		DEFAULT 1

	READ CYCLE MODAL


	RELEASE WINDOW _pvz0lhvmg

RETURN


*!*********************************************************************
*!
*!      Procedure: CLEANUP
*!
*!      Called by: GEN_PD.PRG                        
*!
*!*********************************************************************
PROCEDURE cleanup

	IF NOT EMPTY(m.g_foxuser)
		SELECT (m.g_foxuser)
		USE
		SELECT (m.workarea)
	ENDIF


	IF NOT m.deleted
		SET DELETED OFF
	ENDIF

	IF m.trbetween = "ON"
		SET TRBET ON
	ENDIF

	IF m.talk
		SET TALK ON
	ENDIF

	IF m.escape
		SET ESCAPE ON
	ENDIF

	IF NOT m.exact
		SET EXACT OFF
	ENDIF

	POP KEY

RETURN
*: EOF: GEN_PD.PRG
