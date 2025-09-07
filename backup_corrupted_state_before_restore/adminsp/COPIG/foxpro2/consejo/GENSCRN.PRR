*:*********************************************************************
*:
*: Procedure file: C:\PRO20\GENSCRN.PRG
*:
*:         System: GENSCRN.PRG
*:         Author: Fox Software Systems Group
*:      Copyright (c) 1991, Fox Software, Inc.
*:  Last modified: 07/01/91     12:05
*:
*:  Procs & Fncts: ERRORHANDLER
*:               : SETALL
*:               : OPENPROJDBF()
*:               : PREPSCREENS()
*:               : BUILD
*:               : CLEANUP
*:               : BUILDENABLE
*:               : BUILDDISABLE
*:               : PREPFILE
*:               : CLOSEFILE
*:               : PREPWNAMES
*:               : SCREENUSED
*:               : ILLEGALNAME
*:               : GETWITHLIST
*:               : REFRESHPREFS
*:               : SUBDEVINFO
*:               : BUILDCTRL
*:               : GENSETENVIRON
*:               : GENCLNENVIRON
*:               : GENCLEANUP
*:               : GENSECT1
*:               : GENSECT2
*:               : ANYDIRECTIVES
*:               : FINDSECTION
*:               : WRITECODE
*:               : ATWNAME
*:               : NOTCOMMENT
*:               : GENCLAUSECODE
*:               : VALICLAUSE
*:               : GENVALIDBODY
*:               : WHENCLAUSE
*:               : GENWHENBODY
*:               : ACTICLAUSE
*:               : DEATCLAUSE
*:               : SHOWCLAUSE
*:               : PLACESAYS
*:               : GENCLOSEDBFS
*:               : GENOPENDBFS
*:               : UNIQUEDBF
*:               : GENUSESTMTS
*:               : FINDRELPATH
*:               : GENORDER
*:               : GENINDEXES
*:               : GENRELATIONS
*:               : GENRELSTMTS
*:               : BUILDFMT
*:               : ANYWINDOWS
*:               : GENACTISTMTS
*:               : PLACEREAD
*:               : ANYMODAL
*:               : ANYLOCK
*:               : GENWITHCLAUSE
*:               : DOPLACECLAUSE
*:               : FINDREADCLAUSES
*:               : SETCLAUSEFLAGS
*:               : GENREADCLAUSES
*:               : GENCLAUSE
*:               : GENGIVENREAD
*:               : GENDIRECTIVE
*:               : SKIPWHITESPACE
*:               : DEFPOPUPS
*:               : GENPOPDEFI
*:               : RELPOPUPS
*:               : DEFWINDOWS
*:               : GENWINDEFI
*:               : GENBOXES
*:               : GENTEXT
*:               : GENFIELDS
*:               : GENINVBUT
*:               : GENTXTRGN
*:               : GENPUSH
*:               : GENRADBUT
*:               : GENCHKBOX
*:               : GENLIST
*:               : FROMPOPUP
*:               : GENPOPUP
*:               : ELEMRANGE
*:               : GENACTWINDOW
*:               : GENDEFAULT
*:               : ANYDISABLED
*:               : ANYPICTURE
*:               : ANYSCROLL
*:               : ANYTAB
*:               : ANYSCHEME
*:               : ANYVALID
*:               : ANYTITLEORFOOTER
*:               : ANYWHEN
*:               : ANYMESSAGE
*:               : ANYERROR
*:               : ANYFILL
*:               : ANYWINDOWCHARS
*:               : ANYBORDER
*:               : WINDOWFROMTO
*:               : HEADER
*:               : GENFUNCHEADER
*:               : COMMENTBLOCK
*:               : GENCOMMENT
*:               : BASENAME
*:               : STRIPEXT
*:               : STRIPPATH
*:               : UNIQUEWIN
*:               : ADDTOCTRL
*:               : OKTOGENERATE
*:               : NOTVARIABLE
*:               : OBJECT
*:               : COMBINE
*:               : ACTTHERM
*:               : UPDTHERM
*:               : DEACTTHERMO
*:               : ESCHANDLER
*:               : ERRLOG
*:               : ERRSHOW
*:               : OPENERRFILE
*:
*:          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*:               : SETALL         (procedure in GENSCRN.PRG)
*:               : OPENPROJDBF()  (function  in GENSCRN.PRG)
*:               : PREPSCREENS()  (function  in GENSCRN.PRG)
*:               : BUILD          (procedure in GENSCRN.PRG)
*:               : CLEANUP        (procedure in GENSCRN.PRG)
*:
*:      Documented 07/01/91 at 12:18               FoxDoc  version 2.10
*:*********************************************************************
*
* GENSCRN - Screen Code Generator.
*
* Fox Software Systems Group
*
* Copyright (c) 1990 Fox Software, Inc.
* 134 W. South Boundary
* Perrysburg, Ohio  43551
*
* Description:
* This program generates code for objects designed and built with
* FoxPro 2.0 SCREEN BUILDER.
*
* Notes:
* In this program, for clarity/readability reasons, we use variable
* names that are longer than 10 characters.  Note, however, that only
* the first 10 characters are significant.
*
* Modification History:
* December 13, 1990			JAC				Program Created
*
PARAMETER m.projdbf, m.recno

IF SET("TALK") = "ON"
	SET TALK OFF
	m.talkset = "ON"
ELSE
	m.talkset = "OFF"
ENDIF
m.escape = SET("ESCAPE")
ON ESCAPE
SET ESCAPE OFF
m.trbetween = SET("TRBET")
SET TRBET OFF
m.comp = SET("COMPATIBLE")
SET COMPATIBLE FOXPLUS

*
* Declare Global Constants
*
M.G_OTSCREEN	= 1
M.G_OTWORKAREA	= 2
M.G_OTINDEX		= 3
M.G_OTREL		= 4
M.G_OTTEXT		= 5
M.G_OTBOX		= 7
M.G_OTLIST		= 11
M.G_OTTXTBUT	= 12
M.G_OTRADBUT	= 13
M.G_OTCHKBOX	= 14
M.G_OTFIELD		= 15
M.G_OTPOPUP		= 16
M.G_OTINVBUT  	= 20

STORE 45 TO M.G_AUTHORLEN, M.G_COMPLEN, M.G_ADDRLEN
M.G_CITYLEN	= 20
M.G_STATLEN	= 2
M.G_ZIPLEN	= 10

M.G_SGSAY  = 0
M.G_SGGET  = 1
M.G_SGEDIT = 2
M.G_SGFROM = 3
M.G_SGBOX  = 4
M.G_SGBOXD = 5
M.G_SGBOXP = 6
M.G_SGBOXC = 7

STORE 25 TO M.G_MAXDBFS, M.G_MAXWINDS, M.G_MAXPOPS
M.G_MAXSCREENS = 5
M.G_ESC      = CHR(27)
M.G_NULL     = CHR(0)
M.G_CRET     = CHR(13)
M.G_UNDER    = "_"
M.G_SINGLE	 = "⁄ƒø≥Ÿƒ¿≥"
M.G_DOUBLE   = "…Õª∫ºÕ»∫"
M.G_PANEL    = "€€€€€€€€"
M.G_FROMONE  = 1
M.G_UNTILEND = 0

M.G_ERROR_1 = "Minor"
M.G_ERROR_2 = "Serious"
M.G_ERROR_3 = "Fatal"

*
* Declare Variables
*
STORE "" TO m.cursor, m.consol, m.bell, m.exact, m.safety, m.fixed, m.print
STORE 0 TO m.deci, m.memowidth

m.g_closefile  = .F.		  && Generate code to close files?
m.g_current    = ""
m.g_defasch1   = 0			  && Default color scheme 1
m.g_defasch2   = 0			  && Default color scheme 2
m.g_defwin     = .F.		  && Generate code to define windows?
m.g_errlog     = ""			  && Path + name off .ERR file
m.g_homedir    = ""			  && Application Home Directory
m.g_idxfile    = 'idxfile.idx' && Index file
m.g_itse       = CHR(0)		  && Designating character from #ITSEXPRESSION
m.g_lastwindow = ""			  && Name of last window defined
m.g_keyno      = 0
m.g_havehandle = .F.
m.g_redefi     = .F.          && Don't redefine windows
m.g_nscreens   = 0			  && Number of screens
m.g_nwindows   = 0			  && Number of unique windows
m.g_multreads  = .F.		  && Multiple reads?
m.g_openfile   = .F.		  && Generate code to open files?
m.g_orghandle  = -1			  && File handle for ctrl file
m.g_outfile    = ""			  && Output file name
m.g_projalias  = "" 		  && Project database alias
m.g_projpath   = ""
m.g_rddir      = .F.		  && Is there a #READCLAUSES directive?
m.g_rddirno    = 0			  && Number of 1st screen with #READ directive
m.g_readcycle  = .F.		  && READ CYCLE?
m.g_readline   = ""			  && Line with #READCLAUSES directive
m.g_readlock   = .F.		  && READ LOCK/NOLOCK?
m.g_readmodal  = .F.		  && READ MODAL?
m.g_relwin     = .F.		  && Generate code to release windows?
m.g_snippcnt   = 0			  && Count of snippets
m.g_somepops   = .F.		  && Any Generated popups?
m.g_status     = 0
m.g_thermwidth = 0			  && Thermometer width
m.g_tmpfile    = SYS(3)+".tmp"  && Temporary file
m.g_tmphandle  = -1			  && File handle for tmp file
m.g_windows    = .F.		  && Any windows in screen files?
m.g_withlist   = ""
m.g_workarea   = 0

m.g_validtype  = ""
m.g_validname  = ""
m.g_whentype   = ""
m.g_whenname   = ""
m.g_actitype   = ""
m.g_actiname   = ""
m.g_deattype   = ""
m.g_deatname   = ""
m.g_showtype   = ""
m.g_showname   = ""

m.g_devauthor  = PADR("Author's Name",45," ")
m.g_devcompany = PADR("Company Name",45, " ")
m.g_devaddress = PADR("Address",45," ")
m.g_devcity    = PADR("City",20," ")
m.g_devstate   = "  "
m.g_devzip     = PADR("Zip",10," ")

STORE "*" TO m.g_corn1, m.g_corn2, m.g_corn3, m.g_corn4, m.g_corn5, ;
	m.g_corn6, m.g_horiz, m.g_verti

*   databases opened in the generated program.
*
DIMENSION g_dbfs[M.G_MAXDBFS]
g_dbfs = ""

*	generated popup names associated with scollable lists.
*
*	g_popups[*,1] - screen basename
*	g_popups[*,2] - record number
*	g_popups[*,3] - generated popup name
*
DIMENSION g_popups[M.G_MAXPOPS,3]
g_popups = ""

* 	screen file name array definition
*
* 	g_screens[*,1] - screen fully qualified name
* 	g_screens[*,2] - window name if any
* 	g_screens[*,3] - recno in proj dbf
*   g_screens[*,4] - initially opened?
*	g_screens[*,5] - alias
*
DIMENSION g_screens[M.G_MAXSCREENS,5]
g_screens = ""

DIMENSION g_wndows[M.G_MAXWINDS,2]
g_wndows = ""

DIMENSION g_wnames[M.G_MAXSCREENS]
g_wnames = ""

** formfeed 
**
** Main program
**

ON ERROR DO errorhandler WITH MESSAGE(), LINENO(), M.G_ERROR_3

IF PARAMETERS() < 2
	IF m.talkset = "ON"
		SET TALK ON
	ENDIF
	IF m.comp = "ON"
		SET COMPATIBLE ON
	ENDIF
	IF m.escape = "ON"
		SET ESCAPE ON
	ENDIF
	DO errorhandler WITH "Invalid number of parameters passed to"+;
		" the generator",LINENO(),M.G_ERROR_3
	RETURN m.g_status
ENDIF

DO setall
IF openprojdbf(m.projdbf, m.recno) AND prepscreens()
	DO build
ENDIF

DO cleanup

ON ERROR
RETURN m.g_status

** formfeed 
**
** Code Responsible for Genscrn's environment setting.
**

*
* SETALL - Create program's environment.
*
* Description:
* Save the user's environment that is being modified by the GENSCRN,
* then issue various SET commands.
*
*!*********************************************************************
*!
*!      Procedure: SETALL
*!
*!      Called by: GENSCRN.PRG                   
*!
*!*********************************************************************
PROCEDURE setall
CLEAR PROGRAM
CLEAR GETS

m.g_workarea = SELECT()
SET TEXTMERGE DELIMITERS
SET UDFPARMS TO VALUE

m.memowidth = SET("MEMOWIDTH")
SET MEMOWIDTH TO 256
m.cursor = SET("CURSOR")
SET CURSOR OFF
m.consol = SET("CONSOLE")
SET CONSOLE OFF
m.bell = SET("BELL")
SET BELL OFF
m.exact = SET("EXACT")
SET EXACT ON
m.safety = SET("SAFETY")
m.deci = SET("DECIMALS")
SET DECIMALS TO 0
m.fixed = SET("FIXED")
SET FIXED ON
m.print = SET("PRINT")
SET PRINT OFF
_PRETEXT = ""

*
* CLEANUP - Restore environment to pre-execution state.
*
* Description:
* Put SET command settings back the way we found them.
*
*!*********************************************************************
*!
*!      Procedure: CLEANUP
*!
*!      Called by: GENSCRN.PRG                   
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : ESCHANDLER     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE cleanup
PRIVATE i
IF EMPTY(m.g_projalias)
	RETURN
ENDIF
SELECT (m.g_projalias)
USE
FOR i = 1 TO m.g_nscreens
	IF NOT EMPTY(g_screens[i,4])
		LOOP
	ENDIF
	IF USED(g_screens[i,5])
		SELECT (g_screens[i,5])
		USE
	ENDIF
ENDFOR
SELECT (m.g_workarea)

DELETE FILE (m.g_tmpfile)
DELETE FILE (m.g_idxfile)

IF m.cursor = "ON"
	SET CURSOR ON
ELSE
	SET CURSOR OFF
ENDIF
IF m.consol = "ON"
	SET CONSOLE ON
ELSE
	SET CONSOLE OFF
ENDIF
IF m.escape = "ON"
	SET ESCAPE ON
ELSE
	SET ESCAPE OFF
ENDIF
IF m.bell = "ON"
	SET BELL ON
ELSE
	SET BELL OFF
ENDIF
IF m.exact = "ON"
	SET EXACT ON
ELSE
	SET EXACT OFF
ENDIF
IF m.safety = "ON"
	SET SAFETY ON
ELSE
	SET SAFETY OFF
ENDIF
IF m.talkset = "ON"
	SET TALK ON
ENDIF
IF m.comp = "ON"
	SET COMPATIBLE ON
ENDIF
IF m.print = "ON"
	SET PRINT ON
ENDIF
SET DECIMALS TO m.deci
SET MEMOWIDTH TO m.memowidth
IF m.fixed = "ON"
	SET FIXED ON
ELSE
	SET FIXED OFF
ENDIF
IF m.trbetween = "ON"
	SET TRBET ON
ELSE
	SET TRBET OFF
ENDIF

** formfeed 
**
** Environment setting code in preparation for generation.
**

*
* BUILDENABLE - Enable code generation.
*
* Description:
* Call prepfile to open output file(s).
* If error(s) encountered in prepfile then exit, otherwise
* SET TEXTMERGE ON
*
* Returns: .T. on success; .F. on failure
*
*!*********************************************************************
*!
*!      Procedure: BUILDENABLE
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!
*!          Calls: PREPFILE       (procedure in GENSCRN.PRG)
*!               : ESCHANDLER     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE buildenable
DO prepfile WITH m.g_outfile, m.g_orghandle
DO prepfile WITH m.g_tmpfile, m.g_tmphandle

SET TEXTMERGE ON
ON ESCAPE DO eschandler
SET ESCAPE ON

*
* BUILDDISABLE - Disable code generation.
*
* Description:
* Issue the command SET TEXTMERGE OFF.
* Close the generated output file.
* Close the temporary file.
* If anything goes wrong display appropriate message to the user.
*
*!*********************************************************************
*!
*!      Procedure: BUILDDISABLE
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!               : ESCHANDLER     (procedure in GENSCRN.PRG)
*!
*!          Calls: CLOSEFILE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE builddisable
SET ESCAPE OFF
ON ESCAPE
SET TEXTMERGE OFF
IF m.g_havehandle
	DO closefile WITH m.g_orghandle
	DO closefile WITH m.g_tmphandle
ENDIF

*
* PREPFILE - Create and open the application output file.
*
* Description:
* Create or open a file that will hold the generated application.
* If error(s) encountered at any time issue an error message
* and return .F.
*
*!*********************************************************************
*!
*!      Procedure: PREPFILE
*!
*!      Called by: BUILDENABLE    (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!
*!    Other Files: M.FILENAME
*!
*!*********************************************************************
PROCEDURE prepfile
PARAMETER m.filename, m.ifp
PRIVATE m.msg
m.ifp = FCREATE(m.filename)

IF (m.ifp = -1)
	m.msg = "Cannot open "+m.filename
	m.g_havehandle = .F.
	DO errorhandler WITH m.msg, LINENO(), M.G_ERROR_3
ELSE
	m.g_havehandle = .T.
ENDIF

*
* CLOSEFILE - Close a low level file opened with FCREATE.
*
*!*********************************************************************
*!
*!      Procedure: CLOSEFILE
*!
*!      Called by: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : BUILDDISABLE   (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE closefile
PARAMETER m.ifp
IF NOT FCLOSE(m.ifp)
	DO errorhandler WITH "Unable to close the generated file",;
		LINENO(), M.G_ERROR_2
ENDIF

*
* PREPSCREENS - Prepare screen file(s) for processing.
*
* Description:
* Open PJX database, index it to find all screen files belonging
* to a screen set if part of a project.
* Open all screen file(s).  If screen file already opened, then
* select it.  Assign unique aliases to screen with name conflicts.
* If error is encountered while opening any of the screen files
* this program will be aborted.
*
*!*********************************************************************
*!
*!       Function: PREPSCREENS()
*!
*!      Called by: GENSCRN.PRG                   
*!
*!          Calls: STRIPPATH      (procedure in GENSCRN.PRG)
*!               : STRIPEXT       (procedure in GENSCRN.PRG)
*!               : SCREENUSED     (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : PREPWNAMES     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION prepscreens
PRIVATE m.status, m.projdbf, m.saverec, m.dbname, m.dbalias
m.status = .T.

SELECT (m.g_projalias)
SET SAFETY OFF
INDEX ON STR(Scrnorder) TO (m.g_idxfile) COMPACT
SET SAFETY ON
GO TOP
SCAN FOR NOT DELETED() AND Setid = m.g_keyno AND Type = 's'
	m.saverec = RECNO()
	m.dbname  = FULLPATH(ALLTRIM(Name), m.g_projpath)
	m.g_nscreens = m.g_nscreens + 1
	
	IF MOD(m.g_nscreens,5)=0
		DIMENSION g_screens[ALEN(g_screens,1)+5,5]
		DIMENSION g_wnames [ALEN(g_wnames)+5]
	ENDIF
	
	m.dbalias = strippath(stripext(m.dbname))
	IF screenused(m.dbalias, basename(m.dbname))
		g_screens[m.g_nscreens,4] = .T.
	ELSE
		g_screens[m.g_nscreens,4] = .F.
		SELECT 0
		USE (m.dbname) AGAIN ALIAS (g_screens[m.g_nscreens,5])
	ENDIF
	IF FCOUNT() <> 57
		DO errorhandler WITH "Screen "+m.dbalias+" is invalid",LINENO(),;
			M.G_ERROR_2
		RETURN .F.
	ENDIF
	g_screens[m.g_nscreens,1] = m.dbname
	IF NOT EMPTY(Style)
		IF EMPTY(Name)
			g_screens[m.g_nscreens,2] = LOWER(SYS(2015))
		ELSE
			g_screens[m.g_nscreens,2] = ALLTRIM(LOWER(Name))
		ENDIF
		DO prepwnames WITH m.g_nscreens
	ENDIF
	
	SELECT (m.g_projalias)
	GOTO RECORD m.saverec
	g_screens[m.g_nscreens,3] = m.saverec
ENDSCAN
RETURN m.status

*
* PREPWNAMES - Store #WNAME directive strings.
*
*!*********************************************************************
*!
*!      Procedure: PREPWNAMES
*!
*!      Called by: PREPSCREENS()  (function  in GENSCRN.PRG)
*!
*!          Calls: SKIPWHITESPACE (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE prepwnames
PARAMETER m.scrnno
PRIVATE m.lineno, m.textline
m.lineno = ATLINE('#WNAM',UPPER(Setupcode))
IF m.lineno = 0
	RETURN
ENDIF
m.textline = MLINE(Setupcode,m.lineno)
IF AT('#WNAM',UPPER(m.textline)) = 1
	g_wnames[m.scrnno] = skipwhitespace(m.textline)
ENDIF

*
* SCREENUSED - Check to see if screen file already opened.
*
*!*********************************************************************
*!
*!      Procedure: SCREENUSED
*!
*!      Called by: PREPSCREENS()  (function  in GENSCRN.PRG)
*!
*!          Calls: ILLEGALNAME    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION screenused
PARAMETER m.dbalias, m.dbname
IF NOT USED(m.dbalias)
	IF illegalname(m.dbalias) OR m.dbname=m.dbalias
		g_screens[m.g_nscreens,5] = "S"+SUBSTR(LOWER(SYS(3)),2,8)
	ELSE
		g_screens[m.g_nscreens,5] = m.dbalias
	ENDIF
	RETURN .F.
ENDIF
SELECT (m.dbalias)
IF RAT(".SCX",DBF())<>0
	g_screens[m.g_nscreens,5] = m.dbalias
	RETURN .T.
ELSE
	g_screens[m.g_nscreens,5] = "S"+SUBSTR(LOWER(SYS(3)),2,8)
ENDIF
RETURN .F.

*
* ILLEGALNAME - Check if default alias will be used when this
*               database is USEd. (i.e., 1st letter is not A-Z,
*				a-z or '_', or any one of ramaining letters is not
*				alphanumeric.)
*
*!*********************************************************************
*!
*!      Procedure: ILLEGALNAME
*!
*!      Called by: SCREENUSED     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION illegalname
PARAMETER m.menuname
PRIVATE m.start, m.aschar, m.length
m.length = LEN(m.menuname)
m.start  = 0
DO WHILE m.start < m.length
	m.start  = m.start + 1
	m.aschar = ASC(SUBSTR(m.menuname, m.start, 1))
	IF m.start<>1 AND (m.aschar >= 48 AND m.aschar <= 57)
		LOOP
	ENDIF
	IF NOT ((m.aschar >= 65 AND m.aschar <= 90) OR ;
			(m.aschar >= 97 AND m.aschar <= 122) OR m.aschar = 95)
		RETURN .T.
	ENDIF
ENDDO
RETURN .F.

*
* OPENPROJDBF - Prepare Project dbf for processing.
*
* Description:
* Check to see if projdbf has an appropriate number of fields.
* Find the screen set record.
* Extract information from the SETID record.
*
*!*********************************************************************
*!
*!       Function: OPENPROJDBF()
*!
*!      Called by: GENSCRN.PRG                   
*!
*!          Calls: STRIPEXT       (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : REFRESHPREFS   (procedure in GENSCRN.PRG)
*!               : GETWITHLIST    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION openprojdbf
PARAMETER m.projdbf, m.recno

SELECT 0
IF USED("projdbf")
	m.g_projalias = "P"+SUBSTR(LOWER(SYS(3)),2,8)
ELSE
	m.g_projalias = "projdbf"
ENDIF
USE (m.projdbf) ALIAS (m.g_projalias)
m.g_errlog = stripext(m.projdbf)
m.g_projpath = SUBSTR(m.projdbf,1,RAT("\",m.projdbf))

IF FCOUNT() <> 33
	DO errorhandler WITH "Generator out of date.",;
		LINENO(), M.G_ERROR_2
	RETURN .F.
ENDIF

DO refreshprefs
GOTO m.recno
m.g_keyno      = Setid
m.g_outfile    = ALLTRIM(SUBSTR(Outfile,1,AT(M.G_NULL,Outfile)-1))
m.g_outfile    = FULLPATH(m.g_outfile, m.g_projpath)
m.g_openfiles  = Openfiles
m.g_closefiles = Closefiles
m.g_defwin     = Defwinds
m.g_relwin     = Relwinds
m.g_readcycle  = Readcycle
m.g_readlock   = Nolock
m.g_readmodal  = Modal
m.g_multreads  = Multreads
DO getwithlist

*
* GETWITHLIST - Construct the list for READ level WITH clause.
*
*!*********************************************************************
*!
*!      Procedure: GETWITHLIST
*!
*!      Called by: OPENPROJDBF()  (function  in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE getwithlist
PRIVATE m.start, m.cret, m.occurance, m.list
m.start = 1
m.occurance = 1
m.cret = AT(M.G_CRET,Assocwinds,m.occurance)
DO WHILE m.cret<>0
	m.list = ALLTRIM(SUBSTR(Assocwinds,m.start,m.cret-m.start))
	m.g_withlist = m.g_withlist + ;
		IIF(EMPTY(m.g_withlist),"",", ") + m.list
	m.occurance = m.occurance + 1
	m.start = m.cret + 1
	m.cret = AT(M.G_CRET,Assocwinds,m.occurance)
ENDDO

*
* REFRESHPREFS - Refresh Documentation and Developer preferences.
*
* Description:
* Get the newest preferences for documentation style and developer
* data from the HEADER record.
*
*!*********************************************************************
*!
*!      Procedure: REFRESHPREFS
*!
*!      Called by: OPENPROJDBF()  (function  in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : SUBDEVINFO     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE refreshprefs
PRIVATE m.start
LOCATE FOR Type = "H"
IF NOT FOUND ()
	DO errorhandler WITH "Missing header record in "+m.projdbf,;
		LINENO(), M.G_ERROR_2
	RETURN
ENDIF

m.g_homedir = ALLTRIM(SUBSTR(Homedir,1,AT(M.G_NULL,Homedir)-1))

m.start = 1
m.g_devauthor = subdevinfo(m.start,M.G_AUTHORLEN,m.g_devauthor)

m.start = m.start + M.G_AUTHORLEN + 1
m.g_devcompany = subdevinfo(m.start,M.G_COMPLEN,m.g_devcompany)

m.start = m.start + M.G_COMPLEN + 1
m.g_devaddress = subdevinfo(m.start,M.G_ADDRLEN,m.g_devaddress)

m.start = m.start + M.G_ADDRLEN + 1
m.g_devcity = subdevinfo(m.start,M.G_CITYLEN,m.g_devcity)

m.start = m.start + M.G_CITYLEN + 1
m.g_devstate = subdevinfo(m.start,M.G_STATLEN,m.g_devstate)

m.start = m.start + M.G_STATLEN + 1
m.g_devzip = subdevinfo(m.start,M.G_ZIPLEN,m.g_devzip)

IF Cmntstyle = 0
	m.g_corn1 = "÷"
	m.g_corn2 = "∑"
	m.g_corn3 = "”"
	m.g_corn4 = "Ω"
	m.g_corn5 = "«"
	m.g_corn6 = "∂"
	m.g_horiz = "ƒ"
	m.g_verti = "∫"
ENDIF

*
* SUBDEVINFO - Extract strings from the DEVINFO memo field.
*
*!*********************************************************************
*!
*!      Procedure: SUBDEVINFO
*!
*!      Called by: REFRESHPREFS   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION subdevinfo
PARAMETER m.start, m.stop, m.default
PRIVATE m.string
m.string = SUBSTR(Devinfo, m.start, m.stop+1)
m.string = SUBSTR(m.string, 1, AT(M.G_NULL,m.string)-1)
RETURN IIF(EMPTY(m.string), m.default, m.string)

** formfeed 
**
** High Level Controlling Structures in Format file generation.
**

*
* BUILD - Controlling procedure for building of a format file.
*
* Description:
* This procedure is a controlling procedure for the process of
* generating a screen file.  It enables building, activates the
* thermometer, calls BUILDCTRL and combines two output files,
* and finally disables building.
* This procedure also makes calls to UPDTHERM to
* update the thermometer display.
*
*!*********************************************************************
*!
*!      Procedure: BUILD
*!
*!      Called by: GENSCRN.PRG                   
*!
*!          Calls: BUILDENABLE    (procedure in GENSCRN.PRG)
*!               : ACTTHERM       (procedure in GENSCRN.PRG)
*!               : UPDTHERM       (procedure in GENSCRN.PRG)
*!               : BUILDCTRL      (procedure in GENSCRN.PRG)
*!               : COMBINE        (procedure in GENSCRN.PRG)
*!               : BUILDDISABLE   (procedure in GENSCRN.PRG)
*!               : DEACTTHERMO    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE build
DO buildenable
DO acttherm WITH "Generating Screen Code..."
DO updtherm WITH 5

DO buildctrl
DO combine
DO builddisable

DO updtherm WITH 100
DO deactthermo

** formfeed 
**
** Code Associated With Building of the Control Program.
**

*
* BUILDCTRL - Generate Format control file.
*
* Description:
* Buildctrl controls the generation process.  It invokes procedures
* which build the output program from a set of screens.
*
*!*********************************************************************
*!
*!      Procedure: BUILDCTRL
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!
*!          Calls: HEADER         (procedure in GENSCRN.PRG)
*!               : GENSECT1       (procedure in GENSCRN.PRG)
*!               : GENSETENVIRON  (procedure in GENSCRN.PRG)
*!               : GENOPENDBFS    (procedure in GENSCRN.PRG)
*!               : UPDTHERM       (procedure in GENSCRN.PRG)
*!               : DEFWINDOWS     (procedure in GENSCRN.PRG)
*!               : GENSECT2       (procedure in GENSCRN.PRG)
*!               : DEFPOPUPS      (procedure in GENSCRN.PRG)
*!               : BUILDFMT       (procedure in GENSCRN.PRG)
*!               : GENCLNENVIRON  (procedure in GENSCRN.PRG)
*!               : GENCLEANUP     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE buildctrl
PRIVATE m.i

_TEXT = m.g_orghandle

DO header
DO gensect1							&& section 1 setup code
DO gensetenviron					&& generated program's
&& environment setup code
IF m.g_openfiles
	DO genopendbfs					&& USE...INDEX... stmts
	DO updtherm WITH 15				&& and set relations
ENDIF

DO defwindows			 			&& window definitions
DO gensect2							&& section 2 setup code
DO defpopups						&& define popups for scrollable
&& lists
DO buildfmt
DO updtherm WITH 25
IF m.g_windows AND m.g_relwin
	FOR m.i = 1 TO m.g_nwindows
		\RELEASE WINDOW <<g_wndows[m.i,1]>>
	ENDFOR
ENDIF

DO genclnenviron					&& generated program's
&& environment cleanup code
DO gencleanup						&& user cleanup code
DO updtherm WITH 30

* formfeed 

*
* GENSETENVIRON - Generate environment code for the .SPR
*
*!*********************************************************************
*!
*!      Procedure: GENSETENVIRON
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE GENSETENVIRON
\
\#REGION 0
\REGIONAL m.currarea, m.talkstat, m.compstat
\
\IF SET("TALK") = "ON"
\	SET TALK OFF
\	m.talkstat = "ON"
\ELSE
\	m.talkstat = "OFF"
\ENDIF
\m.compstat = SET("COMPATIBLE")
\SET COMPATIBLE FOXPLUS

IF m.g_closefiles
	\
	\m.currarea = SELECT()
	\
ENDIF

*
* GENCLNENVIRON - Generate environment code for the .SPR
*
*!*********************************************************************
*!
*!      Procedure: GENCLNENVIRON
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: GENCLOSEDBFS   (procedure in GENSCRN.PRG)
*!               : RELPOPUPS      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genclnenviron
IF m.g_closefiles
	DO genclosedbfs
ENDIF
IF m.g_somepops
	DO relpopups
ENDIF
\
\#REGION 0
\IF m.talkstat = "ON"
\	SET TALK ON
\ENDIF
\IF m.compstat = "ON"
\	SET COMPATIBLE ON
\ENDIF
\

*
* GENCLEANUP - Generate Cleanup Code.
*
*!*********************************************************************
*!
*!      Procedure: GENCLEANUP
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gencleanup
PRIVATE m.i, m.dbalias

FOR m.i = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	
	GO TOP
	IF EMPTY (Proccode)
		LOOP
	ENDIF
	
	DO commentblock WITH g_screens[m.i,1], " Cleanup Code"
	\#REGION <<m.i>>
	DO writecode WITH Proccode, M.G_FROMONE, M.G_UNTILEND, m.i
ENDFOR

*
* GENSECT1 - Generate #SECTION 1 code for all screens.
*
*!*********************************************************************
*!
*!      Procedure: GENSECT1
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: FINDSECTION    (procedure in GENSCRN.PRG)
*!               : COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gensect1
PRIVATE m.i, m.dbalias, m.string, m.endline, m.srtline, ;
	m.sect1, m.sect2, m.loop, m.j, m.end

m.string = " Setup Code - SECTION 1"

FOR m.i = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	GO TOP
	IF EMPTY (Setupcode)
		LOOP
	ENDIF
	
	m.srtline = M.G_FROMONE
	m.endline = M.G_UNTILEND
	m.sect1 = .F.
	m.sect2 = .F.
	m.loop  = .F.
	
	IF ATLINE("#SECT", UPPER(Setupcode))<>0
		m.srtline = findsection(1, Setupcode)+1
		m.endline = findsection(2, Setupcode)
	ENDIF
	IF m.endline-m.srtline <= 3
		IF m.endline = 0
			m.end = MEMLINES(Setupcode)
		ELSE
			m.end = m.endline-1
		ENDIF
		m.loop = .T.
		m.j = m.srtline
		DO WHILE m.j <= m.end
			IF AT('#',MLINE(Setupcode,m.j))<>1
				m.loop = .F.
				EXIT
			ENDIF
			m.j = m.j + 1
		ENDDO
	ENDIF
	IF m.loop
		LOOP
	ENDIF
	IF NOT (m.srtline=1 OR (m.srtline=m.endline) OR ;
			(m.endline<>0 AND m.srtline>m.endline))
		
		DO commentblock WITH g_screens[m.i,1], m.string
		\#REGION <<m.i>>
		DO writecode WITH Setupcode, m.srtline, m.endline, m.i, 'setup'
	ENDIF
ENDFOR

*
* GENSECT2 - Generate Setup code #SECTION 2.
*
*!*********************************************************************
*!
*!      Procedure: GENSECT2
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: FINDSECTION    (procedure in GENSCRN.PRG)
*!               : ANYDIRECTIVES  (procedure in GENSCRN.PRG)
*!               : COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gensect2
PRIVATE m.i, m.dbalias, m.string, m.endline, m.srtline, ;
	m.linecnt, m.lcnt, m.sect1, m.sect2

m.string = " Setup Code - SECTION 2"

FOR m.i = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	GO TOP
	IF EMPTY (Setupcode)
		LOOP
	ENDIF
	
	m.srtline = M.G_FROMONE
	m.endline = M.G_UNTILEND
	m.sect1 = .F.
	m.sect2 = .F.
	
	IF ATLINE("#SECT", UPPER(Setupcode))<>0
		m.srtline = findsection(1, Setupcode)+1
		m.endline = findsection(2, Setupcode)
	ENDIF
	
	IF m.endline=0 AND m.srtline>1
		LOOP
	ENDIF
	m.lcnt = anydirectives(m.sect1, m.sect2)
	m.linecnt = MEMLINES(Setupcode)
	
	IF m.linecnt > m.lcnt AND m.endline < m.linecnt
		DO commentblock WITH g_screens[m.i,1], m.string
		\#REGION <<m.i>>
		IF m.endline=0
			DO writecode WITH Setupcode, M.G_FROMONE, M.G_UNTILEND, ;
				m.i, 'setup'
		ELSE
			DO writecode WITH Setupcode, m.endline+1, M.G_UNTILEND, ;
				m.i, 'setup'
		ENDIF
	ENDIF
ENDFOR

*
* ANYDIRECTIVES - Check for #READCLAUSES, #ITSEXPRESSION and,
*				  #WNAME directives.
*
*!*********************************************************************
*!
*!      Procedure: ANYDIRECTIVES
*!
*!      Called by: GENSECT2       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION anydirectives
PARAMETER m.sect1, m.sect2
m.lcnt = IIF(m.sect1,1,0) + IIF(m.sect2,1,0)
IF AT('#READ',UPPER(Setupcode))<>0
	IF m.g_rddir = .F.
		m.g_rddir = .T.
		m.g_rddirno = m.i
	ENDIF
	m.lcnt = m.lcnt + 1
ENDIF
IF AT('#ITSE',UPPER(Setupcode))<>0
	m.lcnt = m.lcnt + 1
ENDIF
IF AT('#WNAM',UPPER(Setupcode))<>0
	m.lcnt = m.lcnt + 1
ENDIF
IF AT('#REDE',UPPER(Setupcode))<>0
	m.lcnt = m.lcnt + 1
ENDIF
RETURN m.lcnt

*
* FINDSECTION - Find #SECT... directive.
*
* Description:
* Locate and return the line on which the generator directive '#SECT'
* is located on.  If no valid directive found, return 0.
*
*!*********************************************************************
*!
*!      Procedure: FINDSECTION
*!
*!      Called by: GENSECT1       (procedure in GENSCRN.PRG)
*!               : GENSECT2       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION findsection
PARAMETER m.sectionid, m.memo
PRIVATE m.line, m.linecnt, m.textline
m.line    = ATLINE("#SECT", UPPER(m.memo))
m.linecnt = MEMLINE(m.memo)

DO WHILE m.line <= m.linecnt
	m.textline = MLINE(m.memo, m.line)
	IF AT("#SECT", UPPER(m.textline))=1
		IF m.sectionid = 1
			IF AT("1", m.textline)<>0
				m.sect1 = .T.
				RETURN m.line
			ELSE
				RETURN 0
			ENDIF
		ELSE
			IF AT("2", m.textline)<>0
				m.sect2 = .T.
				RETURN m.line
			ENDIF
		ENDIF
	ENDIF
	m.line = m.line + 1
ENDDO
RETURN 0

*
* WRITECODE - Write contents of a memo to a low level file.
*
* Description:
* Receive a memo field as a parameter and write its contents out
* to the currently opened low level file whose handle is stored
* in the system memory variable _TEXT.  Contents of the system
* memory variable _PRETEXT will affect the positioning of the
* generated text.
*
*!*********************************************************************
*!
*!      Procedure: WRITECODE
*!
*!      Called by: GENCLEANUP     (procedure in GENSCRN.PRG)
*!               : GENSECT1       (procedure in GENSCRN.PRG)
*!               : GENSECT2       (procedure in GENSCRN.PRG)
*!               : GENVALIDBODY   (procedure in GENSCRN.PRG)
*!               : GENWHENBODY    (procedure in GENSCRN.PRG)
*!               : ACTICLAUSE     (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!
*!          Calls: ATWNAME        (procedure in GENSCRN.PRG)
*!               : NOTCOMMENT     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE writecode
PARAMETER m.memo, m.start, m.end, m.scrnno, m.insetup
PRIVATE m.linecnt, m.i, m.line, m.expr
IF m.end > m.start
	m.linecnt = m.end-1
ELSE
	m.linecnt = MEMLINES(m.memo)
ENDIF
_MLINE = 0
IF NOT EMPTY(m.insetup)
	IF NOT EMPTY(g_wnames[m.scrnno])
		FOR m.i = m.start TO m.linecnt
			m.line = IIF(m.start = 1, MLINE(m.memo, 1, _MLINE),;
				MLINE(m.memo, m.i))
			
			IF  AT('#READ', UPPER(m.line))<>1 AND ;
					AT('#ITSE', UPPER(m.line))<>1 AND ;
					AT('#WNAM', UPPER(m.line))<>1 AND ;
					AT('#REDE', UPPER(m.line))<>1
				m.at = atwname(g_wnames[m.scrnno], m.line)
				
				IF m.at <> 0 AND notcomment(m.line)
					m.expr = STUFF(m.line, m.at, ;
						LEN(g_wnames[m.scrnno]), ;
						g_screens[m.scrnno,2])
					\<<m.expr>>
				ELSE
					\<<m.line>>
				ENDIF
			ENDIF
		ENDFOR
		RETURN
	ENDIF
	
	FOR m.i = m.start TO m.linecnt
		m.line = IIF(m.start = 1, MLINE(m.memo, 1, _MLINE),;
			MLINE(m.memo, m.i))
		IF  AT('#READ', UPPER(m.line))<>1 AND ;
				AT('#ITSE', UPPER(m.line))<>1 AND ;
				AT('#WNAM', UPPER(m.line))<>1 AND ;
				AT('#REDE', UPPER(m.line))<>1
			\<<m.line>>
		ENDIF
	ENDFOR
	RETURN
ENDIF

IF NOT EMPTY(g_wnames[m.scrnno])
	FOR m.i = 1 TO m.linecnt
		m.line = IIF(m.start = 1, MLINE(m.memo, 1, _MLINE),;
			MLINE(m.memo,m.i))
		m.at = atwname(g_wnames[m.scrnno], m.line)
		IF m.at <> 0 AND notcomment(m.line)
			m.expr = STUFF(m.line, m.at, ;
				LEN(g_wnames[m.scrnno]), ;
				g_screens[m.scrnno,2])
			\<<m.expr>>
		ELSE
			\<<m.line>>
		ENDIF
	ENDFOR
	RETURN
ENDIF

IF m.start = 1
	FOR m.i = m.start TO m.linecnt
		\<<MLINE(m.memo, 1, _MLINE)>>
	ENDFOR
ELSE
	FOR m.i = m.start TO m.linecnt
		\<<MLINE(m.memo, m.i)>>
	ENDFOR
ENDIF

*
* ATWNAME - Determine if valid m.string is in this line.
*
* Description:
* Make sure that if m.string is in fact the string we want to do
* the substitution on.
*
*!*********************************************************************
*!
*!      Procedure: ATWNAME
*!
*!      Called by: WRITECODE      (procedure in GENSCRN.PRG)
*!               : ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION atwname
PARAMETER m.string, m.line
PRIVATE m.pos, m.before, m.after
m.pos = AT(m.string,m.line)
IF m.pos = 0
	RETURN 0
ENDIF
IF m.pos = 1
	m.pos = AT(m.string+" ",m.line)
ELSE
	IF m.pos = LEN(m.line) - LEN(m.string) + 1
		m.pos = AT(" "+m.string,m.line)
		m.pos = IIF(m.pos<>0, m.pos+1,m.pos)
	ELSE
		m.before = SUBSTR(m.line,m.pos-1,1)
		
		IF m.before = M.G_UNDER OR ;
				(m.before >= '0' AND m.before <= '9') OR ;
				(m.before >= 'a' AND m.before <= 'z') OR ;
				(m.before >= 'A' AND m.before <= 'Z')
			
			RETURN 0
		ENDIF
		m.after = SUBSTR(m.line,m.pos+LEN(m.string),1)
		
		IF m.after = M.G_UNDER OR ;
				(m.after >= '0' AND m.after <= '9') OR ;
				(m.after >= 'a' AND m.after <= 'z') OR ;
				(m.after >= 'A' AND m.after <= 'Z')
			
			RETURN 0
		ENDIF
	ENDIF
ENDIF
RETURN m.pos

*
* NOTCOMMENT - Determine if textline is not a comment line.
*
*!*********************************************************************
*!
*!      Procedure: NOTCOMMENT
*!
*!      Called by: WRITECODE      (procedure in GENSCRN.PRG)
*!               : ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION notcomment
PARAMETER m.textline
PRIVATE m.asterisk, m.isnote
IF EMPTY(m.textline)
	RETURN .T.
ENDIF
m.asterisk = AT("*", m.textline)
m.isnote   = AT("NOTE", m.textline)

IF (m.asterisk = 0 AND m.isnote = 0) OR;
	(m.asterisk <> 1 AND NOT EMPTY(SUBSTR(m.textline,1,m.asterisk-1)))
	RETURN .T.
ENDIF
RETURN .F.

*
* GENCLAUSECODE - Generate code for all read-level clauses.
*
* Description:
* Generate functions containing the code from each screen's
* READ level valid, show, when, activate, and deactivate clauses.
*
*!*********************************************************************
*!
*!      Procedure: GENCLAUSECODE
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!               : DOPLACECLAUSE  (procedure in GENSCRN.PRG)
*!
*!          Calls: VALICLAUSE     (procedure in GENSCRN.PRG)
*!               : WHENCLAUSE     (procedure in GENSCRN.PRG)
*!               : ACTICLAUSE     (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genclausecode
PARAMETER m.screenno
DO valiclause WITH m.screenno
DO whenclause WITH m.screenno
DO acticlause WITH m.screenno
DO deatclause WITH m.screenno
DO showclause WITH m.screenno

*
* VALIDCLAUSE - Generate Read level Valid clause function.
*
* Description:
* Generate the function containing the code segment(s) provided
* by the user for the read level VALID clause.
* If multiple reads have been chosen, then this procedure generates
* a function for a single screen.
* If single read has been chosen and there are multiple screens,
* we will concatenate valid clause code segments form all screens
* to form a single function.
*
*!*********************************************************************
*!
*!      Procedure: VALICLAUSE
*!
*!      Called by: GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENSCRN.PRG)
*!               : GENVALIDBODY   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE valiclause
PARAMETER m.screenno
PRIVATE m.i, m.dbalias

IF m.g_validtype = "EXPR" OR m.g_validtype = ""
	RETURN
ENDIF
DO genfuncheader WITH m.g_validname, "Read Level Valid", .T.
\FUNCTION <<m.g_validname>>     && Read Level Valid

_PRETEXT = ""
IF m.g_multreads
	DO genvalidbody WITH m.screenno
ELSE
	FOR m.i = 1 TO m.g_nscreens
		m.dbalias = g_screens[m.i,5]
		SELECT (m.dbalias)
		DO genvalidbody WITH m.i
	ENDFOR
ENDIF
_PRETEXT = ""

*
* GENVALIDBODY - Put out contents of a valid memo field.
*
*!*********************************************************************
*!
*!      Procedure: GENVALIDBODY
*!
*!      Called by: VALICLAUSE     (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!               : STRIPEXT       (procedure in GENSCRN.PRG)
*!               : GENCOMMENT     (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genvalidbody
PARAMETER m.region
PRIVATE m.name, m.pos

LOCATE FOR Objtype = M.G_OTSCREEN
IF NOT FOUND()
	DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
		LINENO(), M.G_ERROR_3
	RETURN
ENDIF
IF NOT EMPTY(Valid) AND Validtype<>0
	IF NOT m.g_multread
		m.name  = strippath(stripext(DBF()))
		DO gencomment WITH "Valid Code from screen: "+m.name
	ENDIF
	\#REGION <<m.region>>
	DO writecode WITH Valid, M.G_FROMONE, M.G_UNTILEND, m.region
ENDIF

*
* WHENCLAUSE - Generate Read level When clause function.
*
* Description:
* Generate the function containing the code segment(s) provided
* by the user for the read level WHEN clause.
* If multiple reads have been chosen, then this procedure generates
* a function for a single screen (i.e., the one it has been called for).
* If single read has been chosen and there are multiple screens,
* we will concatenate when clause code segments from all screens
* to form a single function.
*
*!*********************************************************************
*!
*!      Procedure: WHENCLAUSE
*!
*!      Called by: GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENSCRN.PRG)
*!               : GENWHENBODY    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE whenclause
PARAMETER m.screenno
PRIVATE m.i, m.dbalias

IF m.g_whentype = "EXPR" OR m.g_whentype = ""
	RETURN
ENDIF
DO genfuncheader WITH m.g_whenname, "Read Level When", .T.
\FUNCTION <<m.g_whenname>>     && Read Level When

_PRETEXT = ""
IF m.g_multreads
	DO genwhenbody WITH m.screenno
ELSE
	FOR m.i = 1 TO m.g_nscreens
		m.dbalias = g_screens[m.i,5]
		SELECT (m.dbalias)
		DO genwhenbody WITH m.i
	ENDFOR
ENDIF
_PRETEXT = ""

*
* GENWHENBODY - Put out contents of when memo field.
*
*!*********************************************************************
*!
*!      Procedure: GENWHENBODY
*!
*!      Called by: WHENCLAUSE     (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!               : STRIPEXT       (procedure in GENSCRN.PRG)
*!               : GENCOMMENT     (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genwhenbody
PARAMETER m.region
PRIVATE m.name, m.pos

LOCATE FOR Objtype = M.G_OTSCREEN
IF NOT FOUND()
	DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
		LINENO(), M.G_ERROR_3
	RETURN
ENDIF

IF NOT EMPTY(When) AND Whentype<>0
	IF NOT m.g_multread
		m.name = strippath(stripext(DBF()))
		DO gencomment WITH "When Code from screen: "+m.name
	ENDIF
	\#REGION <<m.region>>
	DO writecode WITH When, M.G_FROMONE, M.G_UNTILEND, m.region
ENDIF

*
* ACTICLAUSE - Generate Read level Activate clause function.
*
* Description:
* Generate the function containing the code segment(s) provided
* by the user for the read level ACTIVATE clause.
* If multiple reads have been chosen, then this procedure generates
* a function for a single screen (i.e., the one it has been called for).
* If single read has been chosen and there are multiple screens,
* we will concatenate activate clause code segments from all screens
* to form a single function.  Each individual screen's code
* segment will be enclosed in "IF WOUTPUT('windowname')" statement.
* Desk top will be represented by a null character. The above
* mentioned is performed by the procedure genactibody.
*
*!*********************************************************************
*!
*!      Procedure: ACTICLAUSE
*!
*!      Called by: GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : BASENAME       (procedure in GENSCRN.PRG)
*!               : GENCOMMENT     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE acticlause
PARAMETER m.screenno
PRIVATE m.i, m.name

IF m.g_actitype = "EXPR" OR m.g_actitype = ""
	RETURN
ENDIF
DO genfuncheader WITH m.g_actiname, "Read Level Activate", .T.
\FUNCTION <<m.g_actiname>>     && Read Level Activate

IF m.g_multreads
	IF NOT EMPTY(Activate) AND Activtype<>0
		\#REGION <<m.screenno>>
		DO writecode WITH Activate, M.G_FROMONE, M.G_UNTILEND, m.screenno
	ENDIF
ELSE
	FOR m.i = 1 TO m.g_nscreens
		m.dbalias = g_screens[m.i,5]
		SELECT (m.dbalias)
		LOCATE FOR Objtype = M.G_OTSCREEN
		IF NOT FOUND()
			DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
				LINENO(), M.G_ERROR_3
			RETURN
		ENDIF
		IF NOT EMPTY(Activate) AND Activtype<>0
			m.name = basename(g_screens[m.i,1])
			DO gencomment WITH "Activate Code from screen: "+;
				m.name
		ENDIF
		IF NOT EMPTY(Activate) AND Activtype<>0
			\#REGION <<m.i>>
			DO writecode WITH Activate, M.G_FROMONE, M.G_UNTILEND, m.i
		ENDIF
	ENDFOR
ENDIF

*
* DEATCLAUSE - Generate Read level deactivate clause function.
*
* Description:
* Generate the function containing the code segment(s) provided
* by the user for the read level DEACTIVATE clause.
* If multiple reads have been chosen, then this procedure generates
* a function for a single screen (i.e., the one it has been called for).
* If single read has been chosen and there are multiple screens,
* we will concatenate deactivate clause code segments from all screens
* to form a single function.  Each individual screen's code
* segment will be enclosed in "IF WOUTPUT('windowname')" statement.
* Desk top will be represented by a null character. The above
* mentioned is performed by the procedure gendeatbody.
*
*!*********************************************************************
*!
*!      Procedure: DEATCLAUSE
*!
*!      Called by: GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!               : STRIPEXT       (procedure in GENSCRN.PRG)
*!               : GENCOMMENT     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE deatclause
PARAMETER m.screenno
PRIVATE m.i, m.name

IF m.g_deattype = "EXPR" OR m.g_deattype = ""
	RETURN
ENDIF
DO genfuncheader WITH m.g_deatname, "Read Level Deactivate", .T.
\FUNCTION <<m.g_deatname>>     && Read Level Deactivate

IF m.g_multreads
	IF NOT EMPTY(Deactivate) AND Deacttype<>0
		\#REGION <<m.screenno>>
		DO writecode WITH Deactivate, M.G_FROMONE, M.G_UNTILEND, m.screenno
	ENDIF
ELSE
	FOR m.i = 1 TO m.g_nscreens
		m.dbalias = g_screens[m.i,5]
		SELECT (m.dbalias)
		LOCATE FOR Objtype = M.G_OTSCREEN
		IF NOT FOUND()
			DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
				LINENO(), M.G_ERROR_3
			RETURN
		ENDIF
		IF NOT EMPTY(Deactivate) AND deacttype<>0
			m.name = strippath(stripext(g_screens[m.i,1]))
			DO gencomment WITH "Deactivate Code from screen: "+;
				m.name
		ENDIF
		IF NOT EMPTY(Deactivate) AND Deacttype<>0
			\#REGION <<m.i>>
			DO writecode WITH Deactivate, M.G_FROMONE, M.G_UNTILEND, m.i
		ENDIF
	ENDFOR
ENDIF

*
* SHOWCLAUSE - Generate Read level Show clause procedure.
*
* Description:
* Generate the function containing the code segment(s) provided
* by the user for the read level SHOW clause.  The function generated
* for the show clause will consist of refreshable @...SAY code and
* code segment(s) if applicable. If multiple reads have been chosen,
* then this procedure generates a function for a single screen
* (i.e., the one it has been called for).  If single read has been
* chosen and there are multiple screens, we will concatenate show
* clause code segments from all screens to form a single function.
* Each individual screen's refreshable SAYs will be enclosed in
* "IF SYS(2016)=('windowname') OR SYS(2016) = '*'" statement.
* (Desk top will be represented by a null character.)
*
*!*********************************************************************
*!
*!      Procedure: SHOWCLAUSE
*!
*!      Called by: GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : WRITECODE      (procedure in GENSCRN.PRG)
*!               : PLACESAYS      (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!               : STRIPEXT       (procedure in GENSCRN.PRG)
*!               : GENCOMMENT     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE showclause
PARAMETER m.screenno
PRIVATE m.i, m.comment, m.name

IF m.g_showtype = "EXPR" OR m.g_showtype = ""
	RETURN
ENDIF
DO genfuncheader WITH m.g_showname, "Read Level Show", .T.

\FUNCTION <<m.g_showname>>     && Read Level Show
\PRIVATE currwind

\STORE WOUTPUT() TO currwind
_PRETEXT = ""

IF m.g_multreads
	LOCATE FOR Objtype = M.G_OTSCREEN
	IF NOT FOUND()
		DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
			LINENO(), M.G_ERROR_3
		RETURN
	ENDIF
	
	m.comment = .T.
	\#REGION <<m.screenno>>
	IF NOT EMPTY(Show) AND Showtype<>0
		DO writecode WITH Show, M.G_FROMONE, M.G_UNTILEND, m.screenno
	ENDIF
	DO placesays WITH m.comment, m.g_showname, m.screenno
ELSE
	FOR m.i = 1 TO m.g_nscreens
		m.dbalias = g_screens[m.i,5]
		SELECT (m.dbalias)
		m.comment = .F.
		
		LOCATE FOR Objtype = M.G_OTSCREEN
		IF NOT FOUND()
			DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
				LINENO(), M.G_ERROR_3
			RETURN
		ENDIF
		
		m.name = strippath(stripext(g_screens[m.i,1]))
		IF NOT EMPTY(Show) AND Showtype<>0
			DO gencomment WITH "Show Code from screen: "+m.name
			\#REGION <<m.i>>
			m.comment = .T.
			DO writecode WITH Show, M.G_FROMONE, M.G_UNTILEND, m.i
		ENDIF
		
		LOCATE FOR Objtype = M.G_OTSCREEN
		DO placesays WITH m.comment, m.name, m.i
	ENDFOR
ENDIF
_PRETEXT = ""
\IF NOT EMPTY(currwind)
\	ACTIVATE WINDOW (currwind) SAME
\ENDIF

*
* PLACESAYS - Generate @...SAY for refreshable says in the .PRG file.
*
* Description:
* Place @...SAY code for all refreshable say statements into
* the generated SHOW clause function.
*
*!*********************************************************************
*!
*!      Procedure: PLACESAYS
*!
*!      Called by: SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!
*!          Calls: GENCOMMENT     (procedure in GENSCRN.PRG)
*!               : ANYPICTURE     (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE placesays
PARAMETER m.comment, m.scrnname, m.i
PRIVATE m.iswindow, m.sayfound, m.windowname, m.theexpr

IF EMPTY(Style)
	m.iswindow = .F.
ELSE
	m.iswindow = .T.
	m.windowname = g_screens[m.i,2]
ENDIF
m.sayfound = .T.
SCAN FOR Objtype = M.G_OTFIELD AND;
		Objcode = M.G_SGSAY   AND;
		Refresh = .T.
	IF m.sayfound
		IF NOT m.comment
			DO gencomment WITH "Show Code from screen: "+m.scrnname
			\#REGION <<m.i>>
		ENDIF
		\IF SYS(2016) =
		IF m.iswindow
			\\ "<<UPPER(m.windowname)>>" OR SYS(2016) = "*"
			\	ACTIVATE WINDOW <<m.windowname>> SAME
		ELSE
			\\ "" OR SYS(2016) = "*"
			\	ACTIVATE SCREEN
		ENDIF
		m.sayfound = .F.
	ENDIF
	
	m.theexpr = Expr
	\	@ <<Vpos>>,<<Hpos>> SAY <<m.theexpr>> ;
	\		SIZE <<Height>>,<<Width>>
	_PRETEXT = "	"
	DO anypicture
	DO anyscheme
	_PRETEXT = ""
ENDSCAN
IF NOT m.sayfound
	\ENDIF
ENDIF

** formfeed 
*
* GENCLOSEDBFS - Generate code to close all previously opened databases.
*
*!*********************************************************************
*!
*!      Procedure: GENCLOSEDBFS
*!
*!      Called by: GENCLNENVIRON  (procedure in GENSCRN.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : UNIQUEDBF      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genclosedbfs
PRIVATE m.i, m.dbalias, m.dbfcnt, m.firstfound
m.firstfound = .T.
m.dbfcnt = 0
g_dbfs = ""
FOR m.i = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	SCAN FOR Objtype = M.G_OTWORKAREA
		IF m.firstfound
			DO commentblock WITH "","Closing Databases"
			m.firstfound = .F.
		ENDIF
		IF uniquedbf(Tag)
			m.dbfcnt = m.dbfcnt + 1
			g_dbfs[m.dbfcnt] = Tag
		ELSE
			LOOP
		ENDIF	
		\IF USED("<<LOWER(stripext(strippath(Tag)))>>")
		\	SELECT <<LOWER(stripext(strippath(Tag)))>>
		\	USE
		\ENDIF
		\
	ENDSCAN
ENDFOR
IF m.g_closefiles
	\SELECT (m.currarea)
	\
ENDIF

*
* GENOPENDBFS - Generate USE... statement(s).
*
* Description:
* Generate code to open databases, set indexes, and relations as
* specified by the user.
*
*!*********************************************************************
*!
*!      Procedure: GENOPENDBFS
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : UNIQUEDBF      (procedure in GENSCRN.PRG)
*!               : GENUSESTMTS    (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : GENRELATIONS   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genopendbfs
PRIVATE m.dbalias, m.i, m.dbfcnt, m.string, m.msg, m.firstfound
m.firstfound = .T.
FOR m.i = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	m.dbfcnt = 0
	SCAN FOR Objtype = M.G_OTWORKAREA
		IF m.firstfound
			DO commentblock WITH m.dbalias, ;
				" Databases, Indexes, Relations"
			m.firstfound = .F.
		ENDIF
		IF uniquedbf(Tag)
			m.dbfcnt = m.dbfcnt + 1
			g_dbfs[m.dbfcnt] = Tag
		ELSE
			LOOP
		ENDIF
		DO genusestmts
	ENDSCAN
	
	IF m.dbfcnt > 1
		IF NOT EMPTY(m.g_current)
			\SELECT <<m.g_current>>
		ELSE
			m.msg = "Please RE-SAVE screen environment... SCREEN: "+;
				strippath(g_screens[m.i,1])
			DO errorhandler WITH m.msg, LINENO(), M.G_ERROR_1
		ENDIF
		\
	ENDIF
ENDFOR
DO genrelations

*
* UNIQUEDBF - Check if database name already seen.
*
*!*********************************************************************
*!
*!      Procedure: UNIQUEDBF
*!
*!      Called by: GENCLOSEDBFS   (procedure in GENSCRN.PRG)
*!               : GENOPENDBFS    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION uniquedbf
PARAMETER m.dbfname
RETURN IIF(ASCAN(g_dbfs, m.dbfname)=0,.T.,.F.)

*
* GENUSESTMTS - Generate USE... statements
*
* Description:
* Generate USE... statements for each database encoded in the
* screen database.  Generate ORDER statement if appropriate.
*
*!*********************************************************************
*!
*!      Procedure: GENUSESTMTS
*!
*!      Called by: GENOPENDBFS    (procedure in GENSCRN.PRG)
*!
*!          Calls: FINDRELPATH    (procedure in GENSCRN.PRG)
*!               : GENORDER       (procedure in GENSCRN.PRG)
*!               : GENINDEXES     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genusestmts
PRIVATE m.workarea, saverecno, margin, m.name, m.order, m.tag
m.workarea  = Objcode
saverecno = RECNO()
m.order   = LOWER(ALLTRIM(Order))
m.tag     = LOWER(ALLTRIM(Tag2))
m.name    = LOWER(Tag)
relpath   = LOWER(findrelpath(Name))

IF Unique AND EMPTY(m.g_current)
	m.g_current = m.name
ENDIF

margin = 4
IF EMPTY(Name)
	\SELECT <<m.name>>
	RETURN
ENDIF
\IF USED("<<m.name>>")
\	SELECT <<m.name>>
IF genindexes ("select")=0
	indexfound = 0
	\	SET ORDER TO
	DO genorder WITH indexfound,m.order,m.tag,m.name
ELSE
	indexfound = 1
	\\ ADDITIVE ;
	\		ORDER
	DO genorder WITH indexfound,m.order,m.tag,m.name
ENDIF

\ELSE
\	SELECT 0
\	USE (LOCFILE("<<relpath>>","DBF",
\\"Where is <<basename(relpath)>>?"));
\		AGAIN ALIAS <<m.name>>
margin = 42+LEN(relpath)+2*LEN(m.name)
= genindexes("use")

GOTO saverecno
\\ ;
\		ORDER
DO genorder WITH indexfound,m.order,m.tag,m.name
\ENDIF
\

*
* FINDRELPATH - Find relative path for DATABASES.
*
*!*********************************************************************
*!
*!      Procedure: FINDRELPATH
*!
*!      Called by: GENUSESTMTS    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION findrelpath
PARAMETER m.dbfname
PRIVATE m.fullpath, m.relpath
m.fullpath = FULLPATH(m.dbfname, g_screens[1,1])
m.relpath    = SYS(2014, m.fullpath, m.g_homedir)
RETURN m.relpath

*
* GENORDER - Generate ORDER clause.
*
*!*********************************************************************
*!
*!      Procedure: GENORDER
*!
*!      Called by: GENUSESTMTS    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genorder
PARAMETER m.indexfound, m.order, m.tag, m.dbfname
IF EMPTY(m.order) AND EMPTY(m.tag)  && order set to 0
	\\ 0
	RETURN
ENDIF
IF m.indexfound=0				  && no indexes, order<>0, struct cdx
	\\ TAG "<<m.tag>>"
ELSE
	IF EMPTY(m.tag)               && indexes, order set to an idx file
		\\ <<stripext(m.order)>>
	ELSE                          && indexes, order set to struct cdx
		\\ TAG "<<m.tag>>"
		IF NOT EMPTY (m.order)    && indexes, order set to indep. cdx
			\\ OF <<m.order>>
		ENDIF
	ENDIF
ENDIF

*
* GENINDEXES - Generate index names for a USE statement.
*
*!*********************************************************************
*!
*!      Procedure: GENINDEXES
*!
*!      Called by: GENUSESTMTS    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION genindexes
PARAMETER m.placement
PRIVATE m.idxcount
m.idxcount = 0
SCAN FOR Objtype = M.G_OTINDEX AND Objcode = workarea
	IF m.idxcount > 0
		IF margin > 55
			margin = 8 + LEN(Name)
			\\, ;
			\		<<LOWER(Name)>>
		ELSE
			\\, <<LOWER(Name)>>
			margin = margin + 2 + LEN(Name)
		ENDIF
	ELSE
		IF m.placement = "use"
			\\ ;
			\		INDEX <<LOWER(Name)>>
			margin = 8 + LEN(Name)
		ELSE
			\	SET INDEX TO <<LOWER(Name)>>
			margin = 17
			margin = margin + LEN(Name)
		ENDIF
	ENDIF
	m.idxcount = m.idxcount + 1
ENDSCAN
RETURN m.idxcount

*
* GENRELATIONS - Generate code to set all existing relations as they
*				 are encoded in the screen file(s).
*
* Description:
* Generate code for all relations as encoded in the screen database.
*
*!*********************************************************************
*!
*!      Procedure: GENRELATIONS
*!
*!      Called by: GENOPENDBFS    (procedure in GENSCRN.PRG)
*!
*!          Calls: GENRELSTMTS    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genrelations
PRIVATE m.dbalias, m.i
FOR m.i = 1 TO m.g_nscreens
	m.dbalias  = g_screens[m.i,5]
	SELECT (m.dbalias)
	GO TOP
	
	DO genrelstmts
ENDFOR

*
* GENRELSTMTS - Generate relation statements.
*
*!*********************************************************************
*!
*!      Procedure: GENRELSTMTS
*!
*!      Called by: GENRELATIONS   (procedure in GENSCRN.PRG)
*!
*!          Calls: STRIPEXT       (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genrelstmts
PRIVATE m.saverec, m.last, m.firstrel, m.dbfname, m.setskip
m.dbfname  = ""
m.firstrel = .T.
m.last     = 0
m.setskip  = ""

SCAN FOR Objtype = M.G_OTREL
	IF m.last<> Objcode
		IF NOT (m.firstrel OR EMPTY(m.setskip))
			\SET SKIP TO <<m.setskip>>
			\
		ENDIF
		m.saverec = RECNO()
		m.last= Objcode
		
		SCAN FOR Objtype = M.G_OTWORKAREA AND Objcode = last
			m.dbfname = LOWER(stripext(strippath(Name)))
			IF NOT (m.firstrel AND m.g_current = m.dbfname)
				\SELECT <<m.dbfname>>
			ENDIF
			m.setskip = ALLTRIM(LOWER(Expr))
		ENDSCAN
		
		GOTO RECORD m.saverec
		m.firstrel = .F.
	ENDIF
	\SET RELATION OFF INTO <<LOWER(Tag)>>
	\SET RELATION TO <<LOWER(Expr)>> INTO <<LOWER(Tag)>> ADDITIVE
	\
ENDSCAN

IF m.last<> 0
	IF NOT EMPTY(m.setskip))
		\SET SKIP TO <<m.setskip>>
		\
	ENDIF
	IF NOT EMPTY(m.g_current)
		\SELECT <<m.g_current>>
	ENDIF
ENDIF

** formfeed 
**
** Code Associated With Building of the Format file statements.
**

*
* BUILDFMT - Build Format file statements.
*
* Description:
* Generate all boxes, text, fields, push buttons, radio buttons,
* popups, check boxes and scrollable lists encoded in a screen set.
*
*!*********************************************************************
*!
*!      Procedure: BUILDFMT
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : GENDIRECTIVE   (procedure in GENSCRN.PRG)
*!               : UPDTHERM       (procedure in GENSCRN.PRG)
*!               : ANYWINDOWS     (procedure in GENSCRN.PRG)
*!               : GENTEXT        (procedure in GENSCRN.PRG)
*!               : GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENBOXES       (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENINVBUT      (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENACTISTMTS   (procedure in GENSCRN.PRG)
*!               : PLACEREAD      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE buildfmt
PRIVATE m.pos, m.dbalias, m.adjuster, m.recadjust, m.factor
m.g_nwindows = 0
m.g_screen   = 1
m.adjuster   = INT(55/m.g_nscreens)
m.recadjust  = 40
FOR m.g_screen = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.g_screen,5]
	SELECT (m.dbalias)
	GO TOP
	m.factor = m.adjuster/RECCOUNT()
	DO commentblock WITH g_screens[m.g_screen,1], " Screen Layout"
	\#REGION <<m.g_screen>>
	
	IF AT('#ITSE',UPPER(Setupcode))<>0
		DO gendirective WITH ;
			MLINE(Setupcode,ATLINE('#ITSE',UPPER(Setupcode))),;
			'#ITSE'
	ENDIF
	SCAN
		m.recadjust = m.recadjust + m.factor
		DO updtherm WITH INT(m.recadjust)
		DO CASE
		CASE Objtype = M.G_OTSCREEN
			DO anywindows
		CASE Objtype = M.G_OTTEXT
			DO gentext
		CASE Objtype = M.G_OTFIELD
			DO genfields
		CASE Objtype = M.G_OTBOX
			DO genboxes
		CASE Objtype = M.G_OTTXTBUT
			DO genpush
		CASE Objtype = M.G_OTRADBUT
			DO genradbut
		CASE Objtype = M.G_OTINVBUT
			DO geninvbut
		CASE Objtype = M.G_OTPOPUP
			DO genpopup
		CASE Objtype = M.G_OTCHKBOX
			DO genchkbox
		CASE Objtype = M.G_OTLIST
			DO genlist
		ENDCASE
	ENDSCAN
	DO genactistmts
	DO placeread WITH m.g_screen
ENDFOR

*
* ANYWINDOWS - Issue ACTIVATE WINDOW ... SAME.
*
* Description:
* If windows present issue ACTIVATE WINDOW...SAME to make sure
* that the windows stack on screen in the correct order.
*
*!*********************************************************************
*!
*!      Procedure: ANYWINDOWS
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: GENACTWINDOW   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anywindows
IF NOT EMPTY(Style)
	DO genactwindow WITH m.g_screen
	m.g_lastwindow = g_screens[m.g_screen,2]
	m.pos = ASCAN(g_wndows, m.g_lastwindow)
	IF EMPTY(g_wndows[m.pos+1])
		m.g_nwindows = m.g_nwindows + 1
		g_wndows[m.pos+1] = m.g_nwindows
	ENDIF
	m.g_defasch1 = Scheme
	m.g_defasch2 = Scheme2
ELSE
	IF m.g_lastwindow<>""
		\HIDE WINDOW ALL
		\ACTIVATE SCREEN
		m.g_lastwindow = ""
	ENDIF
ENDIF

*
* GENACTISTMTS - Generate Activate window statements.
*
* Description:
* Generate ACTIVATE WINDOW... statements in order to activate all
* windows which have been previously activated with SAME clause.
*
*!*********************************************************************
*!
*!      Procedure: GENACTISTMTS
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genactistmts
PRIVATE m.j, m.pos
\
IF m.g_screen=m.g_nscreens AND NOT m.g_multreads
	IF m.g_nwindows = 1
		\IF NOT WVISIBLE("<<g_wndows[1,1]>>")
		\	ACTIVATE WINDOW <<g_wndows[1,1]>>
		\ENDIF
		RETURN
	ENDIF
	FOR m.j = m.g_nwindows TO 1 STEP -1
		m.pos = ASCAN(g_wndows, m.j)
		IF m.pos<>0
			\IF NOT WVISIBLE("<<g_wndows[m.pos-1]>>")
			\	ACTIVATE WINDOW <<g_wndows[m.pos-1]>>
			\ENDIF
		ENDIF
	ENDFOR
	\
ENDIF

*
* PLACEREAD - Generate a 'READ' statement.
*
* Description:
* Generate a READ statement.  Depending on whether this is a single
* or multiread the read statement may be generated between @...SAY/GETs
* from each screen or at the end of a set of all @...SAY/GETs.
*
*!*********************************************************************
*!
*!      Procedure: PLACEREAD
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYMODAL       (procedure in GENSCRN.PRG)
*!               : ANYLOCK        (procedure in GENSCRN.PRG)
*!               : DOPLACECLAUSE  (procedure in GENSCRN.PRG)
*!               : GENWITHCLAUSE  (procedure in GENSCRN.PRG)
*!               : GENGIVENREAD   (procedure in GENSCRN.PRG)
*!               : COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : FINDREADCLAUSES(procedure in GENSCRN.PRG)
*!               : GENREADCLAUSES (procedure in GENSCRN.PRG)
*!               : GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE placeread
PARAMETER m.i
\
IF m.g_multreads
	\READ
	IF m.g_readcycle AND m.i = m.g_nscreens
		\\ CYCLE
	ENDIF
	DO anymodal
	DO anylock
	DO doplaceclause WITH m.i
	DO genwithclause
	DO gengivenread
ELSE
	IF NOT EMPTY(m.g_rddir) AND m.i = m.g_nscreens
		DO commentblock WITH "","READ contains clauses from SCREEN "+;
			LOWER(g_screens[m.g_rddirno,5])
	ENDIF
	DO findreadclauses
	IF m.i = m.g_nscreens
		\READ
		IF m.g_readcycle
			\\ CYCLE
		ENDIF
		DO anymodal
		DO anylock
		DO genreadclauses
		DO genwithclause
		DO gengivenread
		_TEXT = m.g_tmphandle
		DO genclausecode WITH m.i
		_TEXT = m.g_orghandle
	ENDIF
ENDIF
\

*
* ANYMODAL - Generate MODAL clause on READ.
*
*!*********************************************************************
*!
*!      Procedure: ANYMODAL
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anymodal
IF m.g_readmodal
	\\ MODAL
ENDIF

*
* ANYLOCK - Generate LOCK/NOLOCK clause on READ.
*
*!*********************************************************************
*!
*!      Procedure: ANYLOCK
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anylock
IF m.g_readlock
	\\ NOLOCK
ENDIF

*
* GENWITHCLAUSE - Generate WITH clause on a READ.
*
*!*********************************************************************
*!
*!      Procedure: GENWITHCLAUSE
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genwithclause
IF NOT EMPTY(m.g_withlist)
	\\ ;
	\	WITH <<m.g_withlist>>
ENDIF

*
* DOPLACECLAUSE - Place READ level clauses for multiple reads.
*
* Description:
* According to the read level clauses encoded in the screen file
* set variables holding information about each clause.
*
*!*********************************************************************
*!
*!      Procedure: DOPLACECLAUSE
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : FINDREADCLAUSES(procedure in GENSCRN.PRG)
*!               : GENREADCLAUSES (procedure in GENSCRN.PRG)
*!               : GENCLAUSECODE  (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE doplaceclause
PARAMETER m.i
m.g_validtype  = ""
m.g_validname  = ""
m.g_whentype   = ""
m.g_whenname   = ""
m.g_actitype   = ""
m.g_actiname   = ""
m.g_deattype   = ""
m.g_deatname   = ""
m.g_showtype   = ""
m.g_showname   = ""

LOCATE FOR Objtype = M.G_OTSCREEN
IF NOT FOUND()
	DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
		LINENO(), M.G_ERROR_3
	RETURN
ENDIF

DO findreadclauses
DO genreadclauses
_TEXT = m.g_tmphandle
DO genclausecode WITH m.i
_TEXT = m.g_orghandle

*
* FINDREADCLAUSES - Find clauses for the final READ statement.
*
* Description:
* Keep track of clauses that were already seen to determine what
* clauses are placed on final read.  If this procedure is called for
* a multiple read setting, flag's settings apply only to the current
* screen.
*
*!*********************************************************************
*!
*!      Procedure: FINDREADCLAUSES
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!               : DOPLACECLAUSE  (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : SETCLAUSEFLAGS (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE findreadclauses
PRIVATE m.i, m.dbalias
LOCATE FOR Objtype = M.G_OTSCREEN
IF NOT FOUND()
	DO errorhandler WITH "Error in SCX: Objtype=1 not found",;
		LINENO(), M.G_ERROR_3
	RETURN
ENDIF

IF EMPTY(m.g_validtype) AND NOT EMPTY(Valid)
	DO setclauseflags WITH Validtype, Valid, m.g_validname,;
		m.g_validtype
ENDIF
IF EMPTY(m.g_whentype) AND NOT EMPTY(When)
	DO setclauseflags  WITH Whentype, When, m.g_whenname,;
		m.g_whentype
ENDIF
IF EMPTY(m.g_actitype) AND NOT EMPTY(Activate)
	DO setclauseflags WITH Activtype, Activate, m.g_actiname,;
		m.g_actitype
ENDIF
IF EMPTY(m.g_deattype) AND NOT EMPTY(Deactivate)
	DO setclauseflags WITH Deacttype, Deactivate, m.g_deatname,;
		m.g_deattype
ENDIF
IF EMPTY(m.g_showtype)
	IF NOT EMPTY(Show)
		DO setclauseflags WITH showtype, Show, m.g_showname,;
			m.g_showtype
	ELSE
		LOCATE FOR Objtype = M.G_OTFIELD AND;
			Objcode = M.G_SGSAY AND	Refresh = .T.
		IF FOUND()
			DO setclauseflags WITH 1, Show,	m.g_showname, m.g_showtype
		ENDIF
	ENDIF
ENDIF

*
* SETCLAUSEFLAGS - Load global flags with information about clauses.
*
* Description:
* If a clause is a snippet then a generic name is provided for the
* clause call statement in the READ and that same name is used to
* construct the corresponding function.
*
*!*********************************************************************
*!
*!      Procedure: SETCLAUSEFLAGS
*!
*!      Called by: FINDREADCLAUSES(procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE setclauseflags
PARAMETER m.flagtype, m.memo, m.name, m.type
IF m.flagtype = 0
	m.name = m.memo
	m.type = "EXPR"
ELSE
	m.name = LOWER(SYS(2015))
	m.type = "CODE"
ENDIF

*
* GENREADCLAUSES - Generate Clauses on a READ.
*
* Description:
* Check if clause is appropriate, if so call GENCLAUSE to
* generate the caluse keyword.
*
*!*********************************************************************
*!
*!      Procedure: GENREADCLAUSES
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!               : DOPLACECLAUSE  (procedure in GENSCRN.PRG)
*!
*!          Calls: GENCLAUSE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genreadclauses
IF NOT EMPTY(m.g_validtype)
	DO genclause WITH "VALID", m.g_validname, m.g_validtype
ENDIF
IF NOT EMPTY(m.g_whentype)
	DO genclause WITH "WHEN", m.g_whenname, m.g_whentype
ENDIF
IF NOT EMPTY(m.g_actitype)
	DO genclause WITH "ACTIVATE", m.g_actiname, m.g_actitype
ENDIF
IF NOT EMPTY(m.g_deattype)
	DO genclause WITH "DEACTIVATE", m.g_deatname, m.g_deattype
ENDIF
IF NOT EMPTY(m.g_showtype)
	DO genclause WITH "SHOW", m.g_showname, m.g_showtype
ENDIF

*
* GENCLAUSE - Generate Read Level Clause keyword.
*
* Description:
* Generate SHOW,ACTIVATE,WHEN, or VALID clause keyword for a
* READ statement.
*
*!*********************************************************************
*!
*!      Procedure: GENCLAUSE
*!
*!      Called by: GENREADCLAUSES (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genclause
PARAMETER m.keyword, m.name, m.type
\\ ;
\	<<m.keyword>>
IF m.type = "CODE"
	\\ <<m.name>>
	\\()
ELSE
	\\ <<IIF(RAT(M.G_CRET,m.name)<>0, SUBSTR(m.name,1,LEN(m.name)-1),m.name)>>
ENDIF

*
* GENGIVENREAD - Generate another clause on the READ.
*
*!*********************************************************************
*!
*!      Procedure: GENGIVENREAD
*!
*!      Called by: PLACEREAD      (procedure in GENSCRN.PRG)
*!
*!          Calls: GENDIRECTIVE   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gengivenread
PRIVATE m.i, m.dbalias
IF m.g_multreads
	GO TOP
	IF AT('#READ',UPPER(Setupcode)) <> 0
		DO gendirective WITH ;
			MLINE(Setupcode,ATLINE('#READ',UPPER(Setupcode))),'#READ'
	ENDIF
ELSE
	FOR m.i = 1 TO m.g_nscreens
		m.dbalias = g_screens[m.i,5]
		SELECT (m.dbalias)
		GO TOP
		IF AT('#READ',UPPER(Setupcode))<>0
			DO gendirective WITH ;
				MLINE(Setupcode,ATLINE('#READ',UPPER(Setupcode))),'#READ'
			RETURN
		ENDIF
	ENDFOR
ENDIF

*
* GENDIRECTIVE - Process #ITSEXPRESSION, #READCLAUSES generator directives.
*
*!*********************************************************************
*!
*!      Procedure: GENDIRECTIVE
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!               : GENGIVENREAD   (procedure in GENSCRN.PRG)
*!               : DEFWINDOWS     (procedure in GENSCRN.PRG)
*!
*!          Calls: SKIPWHITESPACE (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gendirective
PARAMETER m.line, m.directive
PRIVATE m.newline
m.g_itse = M.G_NULL
IF AT(m.directive,UPPER(m.line))=1
	IF m.directive  = '#REDE'
		m.g_redefi = .T.
		RETURN
	ENDIF
	m.newline = skipwhitespace(m.line)
	IF NOT EMPTY(m.newline)
		IF m.directive = '#READ'
			\\ ;
			\	<<UPPER(m.newline)>>
		ELSE
			m.g_itse = SUBSTR(m.newline,1,1)
		ENDIF
	ENDIF
ENDIF

*
* SKIPWHITESPACE - Trim all white space from parameter string.
*
*!*********************************************************************
*!
*!      Procedure: SKIPWHITESPACE
*!
*!      Called by: PREPWNAMES     (procedure in GENSCRN.PRG)
*!               : GENDIRECTIVE   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION skipwhitespace
PARAMETER m.line
PRIVATE m.whitespace
m.whitespace = AT(' ',m.line)
IF m.whitespace = 0
	m.whitespace = AT(CHR(9),m.line)
ENDIF
m.line = ALLTRIM(SUBSTR(m.line,m.whitespace))
DO WHILE SUBSTR(m.line,1,1) = CHR(9)
	m.line = ALLTRIM(SUBSTR(m.line, 2))
ENDDO
RETURN m.line

** formfeed 
**
** Code Generating Various Screen Objects
**

*
* DEFPOPUPS - Define popups used in scrollable list definition.
*
* Description:
* Define popup which is later used in the definition of a
* scrollable list.
*
*!*********************************************************************
*!
*!      Procedure: DEFPOPUPS
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: GENPOPDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE defpopups
PRIVATE m.i, m.dbalias, m.cnt, m.anylists
m.cnt = 0
FOR m.i = 1 TO m.g_nscreens
	m.anylists = .F.
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	SCAN FOR Objtype = M.G_OTLIST AND Style > 1
		IF NOT m.anylists
			\
			\#REGION <<m.i>>
			m.anylists = .T.
			m.g_somepops = .T.
		ENDIF
		m.cnt = m.cnt + 1
		g_popups[m.cnt,1] = m.dbalias
		g_popups[m.cnt,2] = RECNO()
		g_popups[m.cnt,3] = LOWER(SYS(2015))
		
		IF MOD(m.cnt,25)=0
			DIMENSION g_popups[ALEN(g_popups,1)+25,3]
		ENDIF
		
		DO genpopdefi
	ENDSCAN
ENDFOR

*
* GENPOPDEFI
*
*!*********************************************************************
*!
*!      Procedure: GENPOPDEFI
*!
*!      Called by: DEFPOPUPS      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genpopdefi
\DEFINE POPUP <<g_popups[m.cnt,3]>> ;
DO CASE
CASE Style = 2
	\	PROMPT STRUCTURE
CASE Style = 3
	\	PROMPT FIELD <<ALLTRIM(Expr)>>
CASE Style = 4
	\	PROMPT FILES
	IF NOT EMPTY(Expr)
		\\ LIKE <<ALLTRIM(Expr)>>
	ENDIF
ENDCASE
\\ ;
\	SCROLL ;
\	MARGIN ;
\	MARK ""
\

*
* RELPOPUPS - Generate code to release generated popups.
*
* Description:
* Generate code to release all popups defined by the generator
* in conjunction with generating scrollable lists.
*
*!*********************************************************************
*!
*!      Procedure: RELPOPUPS
*!
*!      Called by: GENCLNENVIRON  (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE relpopups
PRIVATE m.popcnt, m.i, m.margin
m.popcnt = ALEN(g_popups,1)
m.margin = 16

IF EMPTY(g_popups[1,1])
	RETURN
ENDIF

\RELEASE POPUPS <<g_popups[1,3]>>
m.i = 2
DO WHILE m.i <= m.popcnt
	IF EMPTY(g_popups[m.i,1])
		RETURN
	ENDIF
	IF m.margin > 60
		m.margin = 4
		\\,;
		\	<<g_popups[m.i,3]>>
	ELSE
		\\, <<g_popups[m.i,3]>>
	ENDIF
	m.margin = m.margin + 3 + LEN(g_popups[m.i,3])
	m.i = m.i + 1
ENDDO
\

*
* DEFWINDOWS - Generate code for windows.
*
* Description:
* Generate code to define windows designed in the screen builder.
* Process all SCX databases and if window definitions found
* call GENWINDEFI to define the windows.
*
*!*********************************************************************
*!
*!      Procedure: DEFWINDOWS
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!               : GENDIRECTIVE   (procedure in GENSCRN.PRG)
*!               : GENWINDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE defwindows
PRIVATE m.dbalias, m.pos, m.savearea, m.row, m.col, m.firstfound
m.firstfound = .T.
m.savearea = SELECT()
SET UDFPARMS TO REFERENCE
FOR m.i = 1 TO m.g_nscreens
	m.dbalias = g_screens[m.i,5]
	SELECT (m.dbalias)
	
	SCAN FOR Objtype = M.G_OTSCREEN AND NOT EMPTY(Style)
		IF m.firstfound
			DO commentblock WITH ""," Window definitions"
			m.firstfound = .F.
		ENDIF
		IF AT('#ITSE',UPPER(Setupcode))<>0
			DO gendirective WITH ;
				MLINE(Setupcode,ATLINE('#ITSE',UPPER(Setupcode))),'#ITSE'
		ENDIF
		IF AT('#REDE',UPPER(Setupcode))<>0
			DO gendirective WITH ;
				MLINE(Setupcode,ATLINE('#REDE',UPPER(Setupcode))),'#REDE'
		ENDIF
		DO genwindefi WITH m.i
	ENDSCAN
ENDFOR
SET UDFPARMS TO VALUE
SELECT (m.savearea)

*
* GENWINDEFI - Generate window definition
*
* Description:
* Check to see if window name is unique, if not provide a unique name
* with the use of SYS(2015) and display a warning message if \
* appropriate.  The window definition is generated only if the
* user selected that option in the generator dialog.
*
*!*********************************************************************
*!
*!      Procedure: GENWINDEFI
*!
*!      Called by: DEFWINDOWS     (procedure in GENSCRN.PRG)
*!
*!          Calls: UNIQUEWIN      (procedure in GENSCRN.PRG)
*!               : STRIPPATH      (procedure in GENSCRN.PRG)
*!               : ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : WINDOWFROMTO   (procedure in GENSCRN.PRG)
*!               : ANYTITLEORFOOTE(procedure in GENSCRN.PRG)
*!               : ANYWINDOWCHARS (procedure in GENSCRN.PRG)
*!               : ANYBORDER      (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genwindefi
PARAMETER m.i
PRIVATE m.name, m.pos, m.dupname
m.dupname = .F.
m.name = g_screens[m.i,2]
m.pos = uniquewin(LOWER(m.name), m.g_nwindows, g_wndows)
IF m.pos = 0
	m.dupname = .T.
	m.name = LOWER(SYS(2015))
	g_screens[m.i,2] = m.name
	m.pos = uniquewin(m.name, m.g_nwindows, g_wndows)
ENDIF

= AINS(g_wndows, m.pos)
g_wndows[m.pos,1] = m.name
m.g_nwindows = m.g_nwindows + 1

m.g_windows = .T.
IF NOT m.g_defwin
	RETURN
ENDIF

IF m.dupname
	m.msg = "Duplicate Window Names... - Unique Name Used "+;
		"SCREEN: "+strippath(g_screens[m.i,1])
	DO errorhandler WITH m.msg, LINENO(), M.G_ERROR_1
ENDIF

IF NOT m.g_redefi
	\IF NOT WEXIST("<<m.name>>")
	_PRETEXT = "	"
ENDIF
\DEFINE WINDOW <<m.name>> ;

SELECT (m.g_projalias)
GOTO RECORD g_screens[m.i,3]
IF Arranged
	m.row = Scrnrow
	m.col = Scrncol
	SELECT (m.dbalias)
	DO windowfromto WITH m.row,m.col
ELSE
	SELECT (m.dbalias)
	DO windowfromto
ENDIF
DO anytitleorfooter
DO anywindowchars
DO anyborder
DO anyscheme

IF NOT m.g_redefi
	_PRETEXT = ""
	\ENDIF
ENDIF
\

*
* GENBOXES - Generate code for boxes.
*
* Description:
* Generate code to display all boxes as they appear on the painted
* screen(s).  Note since there is no FILL clause on @...TO command
* we use the command @...BOX whenever the fill option has been chosen.
* If Fill option is not chosen, then we use the simpler form for
* generating boxes, @...TO command which supplies us with clauses
* DOUBLE and PANEL for the box borders.
*
*!*********************************************************************
*!
*!      Procedure: GENBOXES
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genboxes
IF Fillchar <> M.G_NULL
	\@ <<Vpos>>,<<Hpos>>,<<Height+Vpos-1>>,<<Width+Hpos-1>>
	DO CASE
	CASE Objcode = M.G_SGBOX
		\\ BOX "<<M.G_SINGLE>><<Fillchar>>"
	CASE Objcode = M.G_SGBOXD
		\\ BOX "<<M.G_DOUBLE>><<Fillchar>>"
	CASE Objcode = M.G_SGBOXP
		\\ BOX "<<M.G_PANEL>><<Fillchar>>"
	CASE Objcode = M.G_SGBOXC
		IF Boxchar = '"'
			\\ BOX REPLICATE('<<Boxchar>>',8)
		ELSE
			\\ BOX REPLICATE("<<Boxchar>>",8)
		ENDIF
		IF Fillchar = '"'
			\\+'<<Fillchar>>'
		ELSE
			\\+"<<Fillchar>>"
		ENDIF
	ENDCASE
	
	IF NOT EMPTY(Colorpair) OR Scheme <> 0
		\@ <<Vpos>>,<<Hpos>> FILL TO
		\\ <<Height+Vpos-1>>,<<STR(Width+Hpos-1,2)>>
		DO anyscheme
	ENDIF
	RETURN
ELSE
	\@ <<Vpos>>,<<Hpos>> TO <<Height+Vpos-1>>,<<Width+Hpos-1>>
ENDIF
DO CASE
CASE Objcode = M.G_SGBOXD
	\\ DOUBLE
CASE Objcode = M.G_SGBOXP
	\\ PANEL
CASE Objcode = M.G_SGBOXC
	IF Boxchar = '"'
		\\ '<<Boxchar>>'
	ELSE
		\\ "<<Boxchar>>"
	ENDIF
ENDCASE
DO anyscheme

*
* GENTEXT - Generate code for text.
*
* Description:
* Generate code that will display the text exactly as it appears
* in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENTEXT
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gentext
PRIVATE m.theexpr
m.theexpr = Expr
\@ <<Vpos>>,<<Hpos>> SAY <<m.theexpr>>
DO anyscheme

*
* GENFIELDS - Generate fields.
*
* Description:
* Generate code to display SAY, GET, and EDIT statements exactly as they
* appear in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENFIELDS
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYPICTURE     (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!               : ELEMRANGE      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENDEFAULT     (procedure in GENSCRN.PRG)
*!               : ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genfields
PRIVATE m.theexpr
DO CASE
CASE Objcode = M.G_SGSAY
	m.theexpr = Expr
	\@ <<Vpos>>,<<Hpos>> SAY <<m.theexpr>> ;
	\	SIZE <<Height>>,<<Width>>
	DO anypicture
	DO anyscheme
	RETURN
CASE Objcode = M.G_SGGET
	\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
	\	SIZE <<Height>>,<<Width>>
	DO elemrange
CASE Objcode = M.G_SGEDIT
	DO gentxtrgn
	RETURN
ENDCASE

DO gendefault
DO anypicture
DO anywhen
DO anyvalid
DO anymessage
DO anyerror
DO anydisabled
DO anyscheme

*
* GENINVBUT - Generate Invisible buttons.
*
* Description:
* Generate code to display invisible buttons exactly as they appear
* in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENINVBUT
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE geninvbut
\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
\	PICTURE <<Picture>> ;
\	SIZE <<Height>>,<<Width>>,<<Spacing>> ;
\	DEFAULT 0

DO anywhen
DO anyvalid
DO anydisabled
DO anymessage
DO anyscheme

*
* GENTXTRGN - Generate some statements for text edit region.
*
* Description:
* Generate code to display test edit regions exactly as they
* appear on the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENTXTRGN
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!
*!          Calls: GENDEFAULT     (procedure in GENSCRN.PRG)
*!               : ANYTAB         (procedure in GENSCRN.PRG)
*!               : ANYSCROLL      (procedure in GENSCRN.PRG)
*!               : ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gentxtrgn
\@ <<Vpos>>,<<Hpos>> EDIT <<Name>> ;
IF NOT EMPTY(Picture)
	\	PICTURE <<Picture>> ;
ENDIF
\	SIZE <<Height>>,<<Width>>,<<Initialnum>>

DO gendefault
DO anytab
DO anyscroll
DO anywhen
DO anyvalid
DO anymessage
DO anyerror
DO anydisabled
DO anyscheme

*
* GENPUSH - Generate Push buttons.
*
* Description:
* Generate code to display push buttons exactly as they appear
* in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENPUSH
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genpush
PRIVATE m.thepicture

m.thepicture = Picture
\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
\	PICTURE <<m.thepicture>> ;
\	SIZE <<Height>>,<<Width>>,<<Spacing>> ;
\	DEFAULT <<Initialnum>>
DO anywhen
DO anyvalid
DO anydisabled
DO anymessage
DO anyerror
DO anyscheme

*
* GENRADBUT - Generate Radio Buttons.
*
* Description:
* Generate code to display radio buttons exactly as they appear
* in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENRADBUT
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genradbut
PRIVATE m.thepicture

m.thepicture = Picture
\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
\	PICTURE <<m.thepicture>> ;
\	SIZE <<Height>>,<<Width>>,<<Spacing>> ;
\	DEFAULT <<Initialnum>>
DO anywhen
DO anyvalid
DO anydisabled
DO anymessage
DO anyerror
DO anyscheme

*
* GENCHKBOX - Generate Check Boxes
*
* Description:
* Generate code to display check boxes exactly as they appear
* in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENCHKBOX
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genchkbox
PRIVATE m.thepicture

m.thepicture = Picture
\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
\	PICTURE <<m.thepicture>> ;
\	SIZE <<Height>>,<<Width>> ;
\	DEFAULT <<Initialnum>>
DO anywhen
DO anyvalid
DO anydisabled
DO anymessage
DO anyerror
DO anyscheme

*
* GENLIST - Generate Scrollable Lists.
*
* Description:
* Generate code to display scrollable lists exactly as they appear
* in the painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENLIST
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ELEMRANGE      (procedure in GENSCRN.PRG)
*!               : FROMPOPUP      (procedure in GENSCRN.PRG)
*!               : ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genlist
PRIVATE m.pos, m.start
\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
IF NOT EMPTY(Picture)
	\	PICTURE <<Picture>> ;
ENDIF
IF Style = 0
	\	FROM <<Expr>>
	DO elemrange
	\\ ;
	\	SIZE <<Height>>,<<Width>> ;
	\	DEFAULT 1
ELSE
	DO frompopup
ENDIF

DO anywhen
DO anyvalid
DO anydisabled
DO anymessage
DO anyerror
DO anyscheme

*
* FROMPOPUP - Generate code for scrollable list defined from a popup.
*
* Description:
* Generate POPUP <popup name> code as part of a scrollable list
* definition.  Popup name may either be name explicitly provided by
* the user or a unique name generated by SYS(2015) function.
*
*!*********************************************************************
*!
*!      Procedure: FROMPOPUP
*!
*!      Called by: GENLIST        (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE frompopup
PRIVATE m.start, m.pos
\	POPUP
IF Style < 2
	IF NOT EMPTY(Expr)
		\\ <<Expr>> ;
	ENDIF
ELSE
	m.start = 1
	m.pos   = 0
	DO WHILE .T.
		m.pos = ASCAN(g_popups, m.dbalias, m.start)
		IF g_popups[m.pos+1] = RECNO()
			EXIT
		ENDIF
		m.start = m.pos + 3
	ENDDO
	\\ <<g_popups[m.pos+2]>> ;
ENDIF
\	SIZE <<Height>>,<<Width>> ;
\	DEFAULT " "

*
* GENPOPUP - Generate Popups.
*
* Description:
* Generate code to display popups exactly as they appear in the
* painted screen(s).
*
*!*********************************************************************
*!
*!      Procedure: GENPOPUP
*!
*!      Called by: BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!          Calls: ELEMRANGE      (procedure in GENSCRN.PRG)
*!               : ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYDISABLED    (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!               : ANYSCHEME      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genpopup
PRIVATE m.thepicture, m.theinitval

\@ <<Vpos>>,<<Hpos>> GET <<Name>> ;
IF Objcode = M.G_SGGET
	m.thepicture = Picture
	m.theinitval = Initialval
	\	PICTURE <<m.thepicture>> ;
	\	SIZE <<Height>>,<<Width>> ;
	\	DEFAULT <<IIF(EMPTY(m.theinitval), '" "', m.theinitval)>>
ELSE
	\	PICTURE "@^" ;
	\	FROM <<Expr>> ;
	\	SIZE <<Height>>,<<Width>>
	DO elemrange
	\\ ;
	\	DEFAULT 1
ENDIF

DO anywhen
DO anyvalid
DO anydisabled
DO anymessage
DO anyerror
DO anyscheme

*
* ELEMRANGE - Element range clause for popup and scrollable list
*				defined form an array.
*
*!*********************************************************************
*!
*!      Procedure: ELEMRANGE
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!          Calls: ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE elemrange
PRIVATE m.firstelem, m.genericname
m.firstelem = .F.
IF NOT EMPTY(Rangelo)
	m.firstelem = .T.
	\\ ;
	\	RANGE
	IF Lotype = 0
		\\ <<ALLTRIM(Rangelo)>>
	ELSE
		m.genericname = LOWER(SYS(2015))
		\\ <<m.genericname>>()
		DO addtoctrl WITH m.genericname, "Popup From", Rangelo, Name
	ENDIF
ENDIF
IF NOT EMPTY(Rangehi)
	IF NOT m.firstelem
		\\ ;
		\	RANGE 1,
	ELSE
		\\,
	ENDIF
	IF Hitype = 0
		\\ <<ALLTRIM(Rangehi)>>
	ELSE
		m.genericname = LOWER(SYS(2015))
		\\ <<m.genericname>>()
		DO addtoctrl WITH m.genericname, "Popup From", Rangehi, Name
	ENDIF
ENDIF

*
* GENACTWINDOW - Generate Activate Window Command.
*
* Description:
* Generate the ACTIVATE WINDOW... command.
*
*!*********************************************************************
*!
*!      Procedure: GENACTWINDOW
*!
*!      Called by: ANYWINDOWS     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genactwindow
PARAMETER m.cnt
IF m.g_lastwindow = g_screens[m.cnt,2]
	\@ 0,0 CLEAR
ENDIF
IF m.g_multreads
	\ACTIVATE WINDOW <<g_screens[m.cnt,2]>>
	RETURN
ENDIF

\IF WVISIBLE("<<g_screens[m.cnt,2]>>")
\	ACTIVATE WINDOW <<g_screens[m.cnt,2]>> SAME
\ELSE
\	ACTIVATE WINDOW <<g_screens[m.cnt,2]>> NOSHOW
\ENDIF

*
* GENDEFAULT - Generate Default Clause.
*
*!*********************************************************************
*!
*!      Procedure: GENDEFAULT
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gendefault
PRIVATE m.theinitval
IF EMPTY(Initialval) AND EMPTY(Fillchar)
	RETURN
ENDIF
\\ ;
\	DEFAULT
IF EMPTY(Initialval)
	DO CASE
	CASE Fillchar = "D"
		\\ {  /  /  }
	CASE Fillchar = "C" OR Fillchar = "M"
		\\ " "
	CASE Fillchar = "L"
		\\ .F.
	CASE Fillchar = "N"
		\\ 0
	CASE Fillchar = "F"
		\\ 0.0
	ENDCASE
ELSE
	m.theinitval = Initialval
	\\ <<ALLTRIM(m.theinitval)
ENDIF

** formfeed 
**
**  Procedures Generating Various Clauses for Screen Objects
**

*
* ANYDISABLED - Place ENABLE/DISABLE clause.
*
*!*********************************************************************
*!
*!      Procedure: ANYDISABLED
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENINVBUT      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anydisabled
IF Disabled
	\\ ;
	\	DISABLE
ENDIF

*
* ANYPICTURE
*
*!*********************************************************************
*!
*!      Procedure: ANYPICTURE
*!
*!      Called by: PLACESAYS      (procedure in GENSCRN.PRG)
*!               : GENFIELDS      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anypicture
PRIVATE m.sctring
IF NOT EMPTY(Picture)
	\\ ;
	m.string = SUBSTR(Picture,2)
	IF SUBSTR(m.string,1,1) = m.g_itse
		\	PICTURE <<SUBSTR(m.string,2,RAT('"',m.string)-2)>>
	ELSE
		\	PICTURE <<Picture>>
	ENDIF
ENDIF

*
* ANYSCROLL - Place Scroll clause if applicable.
*
*!*********************************************************************
*!
*!      Procedure: ANYSCROLL
*!
*!      Called by: GENTXTRGN      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anyscroll
IF Scrollbar
	\\ ;
	\	SCROLL
ENDIF

*
* ANYTAB - Place Tab clause on an @...EDIT command.
*
*!*********************************************************************
*!
*!      Procedure: ANYTAB
*!
*!      Called by: GENTXTRGN      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anytab
IF Tab
	\\ ;
	\	TAB
ENDIF

*
* ANYSCHEME - Place Color Scheme clause if applicable.
*
*!*********************************************************************
*!
*!      Procedure: ANYSCHEME
*!
*!      Called by: PLACESAYS      (procedure in GENSCRN.PRG)
*!               : GENWINDEFI     (procedure in GENSCRN.PRG)
*!               : GENBOXES       (procedure in GENSCRN.PRG)
*!               : GENTEXT        (procedure in GENSCRN.PRG)
*!               : GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENINVBUT      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anyscheme
IF NOT EMPTY(Colorpair)
	\\ ;
	\	COLOR <<Colorpair>>
	RETURN
ENDIF
IF Scheme <> 0
	\\ ;
	\	COLOR SCHEME <<Scheme>>
	IF Objtype = 16 AND Scheme2<>0
		\\, <<Scheme2>>
	ENDIF
ELSE
	IF m.g_defasch2 <> 0
		DO CASE
		CASE Objtype = 5 AND Height > 1
			\\ ;
			\	COLOR SCHEME <<m.g_defasch2>>
		CASE Objtype = 11
			\\ ;
			\	COLOR SCHEME <<m.g_defasch2>>
		CASE Objtype = 16
			\\ ;
			\	COLOR SCHEME <<m.g_defasch1>>, <<m.g_defasch2>>
		ENDCASE
	ENDIF
ENDIF

*
* ANYVALID - Place Valid clause if applicable.
*
*!*********************************************************************
*!
*!      Procedure: ANYVALID
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENINVBUT      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!          Calls: ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anyvalid
PRIVATE m.genericname, m.valid
IF NOT EMPTY(Valid)
	\\ ;
	IF Validtype = 0
		m.valid = Valid
		\	VALID <<IIF(RAT(M.G_CRET,Valid)<>0, SUBSTR(m.valid,1,LEN(Valid)-1),m.valid)>>
	ELSE
		m.genericname = LOWER(SYS(2015))
		\	VALID <<m.genericname>>()
		DO addtoctrl WITH m.genericname, "VALID", Valid, Name
	ENDIF
ENDIF

*
* ANYTITLEORFOOTER - Place Window Title/Footer clause.
*
*!*********************************************************************
*!
*!      Procedure: ANYTITLEORFOOTER
*!
*!      Called by: GENWINDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anytitleorfooter
PRIVATE m.string, m.thetag
IF NOT EMPTY(Tag)
	\\ ;
	m.string = SUBSTR(Tag,2)
	IF SUBSTR(m.string,1,1) = m.g_itse
		\	TITLE <<SUBSTR(m.string, 2, RAT('"',m.string)-2)>>
	ELSE
		m.thetag = Tag
		\	TITLE <<m.thetag>>
	ENDIF
ENDIF
IF NOT EMPTY(Tag2)
	\\ ;
	m.string = SUBSTR(Tag2,2)
	IF SUBSTR(m.string,1,1) = m.g_itse
		\	FOOTER <<SUBSTR(m.string, 2, RAT('"',m.string)-2)>>
	ELSE
		m.thetag = Tag2
		\	FOOTER <<m.thetag>>
	ENDIF
ENDIF

*
* ANYWHEN - Place a When clause in a Get field.
*
*!*********************************************************************
*!
*!      Procedure: ANYWHEN
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENINVBUT      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!          Calls: ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anywhen
PRIVATE m.genericname, m.when
IF EMPTY(When)
	RETURN
ENDIF
\\ ;
IF Whentype = 0
	m.when = When
	\	WHEN <<IIF(RAT(M.G_CRET,When)<>0, SUBSTR(m.when,1,LEN(When)-1),m.when)>>
ELSE
	m.genericname = LOWER(SYS(2015))
	\	WHEN <<m.genericname>>()
	DO addtoctrl WITH m.genericname, "WHEN", When, Name
ENDIF

*
* ANYMESSAGE - Place a message clause whenever appropriate.
*
*!*********************************************************************
*!
*!      Procedure: ANYMESSAGE
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENINVBUT      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!          Calls: ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anymessage
PRIVATE m.genericname, m.mess
IF EMPTY(Message)
	RETURN
ENDIF
\\ ;
IF Messtype = 0
	m.mess = Message
	\	MESSAGE
	\\ <<IIF(RAT(M.G_CRET,Message)<>0, SUBSTR(m.mess,1,LEN(Message)-1),m.mess)>>
ELSE
	m.genericname = LOWER(SYS(2015))
	\	MESSAGE <<m.genericname>>()
	DO addtoctrl WITH m.genericname, "MESSAGE", Message, Name
ENDIF

*
* ANYERROR - Place an error clause whenever appropriate.
*
*!*********************************************************************
*!
*!      Procedure: ANYERROR
*!
*!      Called by: GENFIELDS      (procedure in GENSCRN.PRG)
*!               : GENTXTRGN      (procedure in GENSCRN.PRG)
*!               : GENPUSH        (procedure in GENSCRN.PRG)
*!               : GENRADBUT      (procedure in GENSCRN.PRG)
*!               : GENCHKBOX      (procedure in GENSCRN.PRG)
*!               : GENLIST        (procedure in GENSCRN.PRG)
*!               : GENPOPUP       (procedure in GENSCRN.PRG)
*!
*!          Calls: ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anyerror
PRIVATE m.genericname, m.err
IF EMPTY(Error)
	RETURN
ENDIF
\\ ;
IF Errortype = 0
	m.err = Error
	\	ERROR
	\\ <<IIF(RAT(M.G_CRET,Error)<>0, SUBSTR(m.err,1,LEN(Error)-1),m.err)>>
ELSE
	m.genericname = LOWER(SYS(2015))
	\	ERROR <<m.genericname>>()
	DO addtoctrl WITH m.genericname, "ERROR", Error, Name
ENDIF

*
* ANYFILL - Place the Fill clause whenever appropriate.
*
*!*********************************************************************
*!
*!      Procedure: ANYFILL
*!
*!*********************************************************************
PROCEDURE anyfill
IF Fillchar <> M.G_NULL
	\\ ;
	\	FILL "<<Fillchar>>"
ENDIF

*
* ANYWINDOWCHARS - Place window characteristics options.
*
* Description:
* Place the FLOAT, GROW, CLOSE, ZOOM, SHADOW, and MINIMIZE clauses
* for a window painted by the user.
*
*!*********************************************************************
*!
*!      Procedure: ANYWINDOWCHARS
*!
*!      Called by: GENWINDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anywindowchars
\\ ;
\	<<IIF(Float, "FLOAT ;", "NOFLOAT ;")>>
\	<<IIF(Close, "CLOSE", "NOCLOSE")>>
IF Shadow
	\\ ;
	\	SHADOW
ENDIF
IF Minimize
	\\ ;
	\	MINIMIZE
ENDIF

*
* ANYBORDER - Place Border type clause on a box.
*
* Description:
* Place border type clause on a box depending on the setting of
* the field Border.
*
*!*********************************************************************
*!
*!      Procedure: ANYBORDER
*!
*!      Called by: GENWINDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE anyborder
IF Border<>1
	\\ ;
ENDIF
DO CASE
CASE Border = 0
	\	NONE
CASE Border = 2
	\	DOUBLE
CASE Border = 3
	\	PANEL
CASE Border = 4
	\	SYSTEM
ENDCASE

*
* WINDOWFROMTO - Place FROM...TO clause on any window.
*
* Description:
* Place FROM...TO clause on any window designed in the screen
* painter.  If window is to be centered, then adjust the coordinates
* accordingly.
*
*!*********************************************************************
*!
*!      Procedure: WINDOWFROMTO
*!
*!      Called by: GENWINDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE windowfromto
PARAMETER m.xcoord, m.ycoord
IF PARAMETERS() = 0
	IF Center
		\	FROM INT((SROW()-<<Height>>)/2),
		\\INT((SCOL()-<<Width>>)/2) ;
		\	TO INT((SROW()-<<Height>>)/2)+<<Height-1>>,
		\\INT((SCOL()-<<Width>>)/2)+<<Width-1>>
	ELSE
		\	FROM <<Vpos>>, <<Hpos>> ;
		\	TO <<Height+Vpos-1>>,<<Width+Hpos-1>>
	ENDIF
ELSE
	\	FROM <<m.xcoord>>, <<m.ycoord>> ;
	\	TO <<Height+m.xcoord-1>>,<<Width+m.ycoord-1>>
ENDIF

** formfeed 
**
** Code Generating Documentation in Control and Format files.
**

*
* HEADER - Generate application program's header.
*
* Description:
* As a part of the application's header generate program name, name
* of the author of the program, copyright notice, company name and
* address, and the word 'Description:' which will be followed with
* the application description generated by a separate procedure.
*
*!*********************************************************************
*!
*!      Procedure: HEADER
*!
*!      Called by: BUILDCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE header
\\*       <<m.g_corn1>><<REPLICATE(m.g_horiz,57)>><<m.g_corn2>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> <<DATE()>>
\\<<PADC(UPPER(ALLTRIM(strippath(m.g_outfile))),IIF(SET("CENTURY")="ON",35,37))," ")>>
\\  <<TIME()>> <<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_corn5>><<REPLICATE(m.g_horiz,57)>><<m.g_corn6>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> <<m.g_devauthor>>
\\<<REPLICATE(" ",56-LEN(m.g_devauthor))>><<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>>
\\ Copyright (c) <<YEAR(DATE())>>
IF LEN(ALLTRIM(m.g_devcompany)) <= 36
	\\ <<ALLTRIM(m.g_devcompany)>>
	\\<<REPLICATE(" ",37-LEN(ALLTRIM(m.g_devcompany)))>>
	\\<<m.g_verti>>
ELSE
	\\ <<REPLICATE(" ",37)>><<m.g_verti>>
	\*       <<m.g_verti>> <<m.g_devcompany>>
	\\<<REPLICATE(" ",56-LEN(m.g_devcompany))>><<m.g_verti>>
ENDIF
\*       <<m.g_verti>> <<m.g_devaddress>>
\\<<REPLICATE(" ",56-LEN(m.g_devaddress))>><<m.g_verti>>

\*       <<m.g_verti>> <<ALLTRIM(m.g_devcity)>>, <<m.g_devstate>>
\\  <<ALLTRIM(m.g_devzip)>>
\\<<REPLICATE(" ",50-(LEN(ALLTRIM(m.g_devcity)+ALLTRIM(m.g_devzip))))>>
\\<<m.g_verti>>

\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> Description:
\\                                            <<m.g_verti>>
\*       <<m.g_verti>>
\\ This program was automatically generated by GENSCRN.
\\    <<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_corn3>><<REPLICATE(m.g_horiz,57)>><<m.g_corn4>>
\

*
* GENFUNCHEADER - Generate Comment for Function/Procedure.
*
*!*********************************************************************
*!
*!      Procedure: GENFUNCHEADER
*!
*!      Called by: VALICLAUSE     (procedure in GENSCRN.PRG)
*!               : WHENCLAUSE     (procedure in GENSCRN.PRG)
*!               : ACTICLAUSE     (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!               : ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE genfuncheader
PARAMETER m.procname, m.from, m.readlevel, m.varname
m.g_snippcnt = m.g_snippcnt + 1
\
\*       <<m.g_corn1>><<REPLICATE(m.g_horiz,57)>><<m.g_corn2>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
IF m.readlevel
	\*       <<m.g_verti>>
	\\ <<UPPER(m.procname)>>           <<m.from>>
	\\<<REPLICATE(" ",35-LEN(m.from))>><<m.g_verti>>
ELSE
	\*       <<m.g_verti>>
	\\ <<UPPER(m.procname)>>           <<m.varname>> <<m.from>>
	\\<<REPLICATE(" ",34-LEN(m.varname+m.from))>><<m.g_verti>>
ENDIF
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> Function Origin:
\\<<REPLICATE(" ",40)>><<m.g_verti>>
IF m.readlevel
	\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
	\*       <<m.g_verti>> From Screen:
	IF m.g_nscreens > 1 AND NOT m.g_multread
		\\         Multiple Screens
		\\<<REPLICATE(" ",19)>><<m.g_verti>>
	ELSE
		\\         <<basename(SYS(2014,DBF()))>>
		\\<<REPLICATE(" ",35-LEN(basename(SYS(2014,DBF()))))>>
		\\<<m.g_verti>>
	ENDIF
	\*       <<m.g_verti>> Called By:           READ Statement
	\\<<REPLICATE(" ",21)>><<m.g_verti>>
	\*       <<m.g_verti>> Snippet Number:
	\\      <<ALLTRIM(STR(m.g_snippcnt,2))>>
	\\<<REPLICATE(" ",35-LEN(ALLTRIM(STR(m.g_snippcnt,2))))>><<m.g_verti>>
	\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
	\*       <<m.g_corn3>><<REPLICATE(m.g_horiz,57)>><<m.g_corn4>>
	\*
	RETURN
ENDIF
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> From Screen:
\\         <<basename(SYS(2014,DBF()))>>
\\,     Record Number:  <<STR(RECNO(),3)>>
\\<<REPLICATE(" ",10-LEN(basename(SYS(2014,DBF())+STR(RECNO(),3))))>>
\\<<m.g_verti>>
IF NOT EMPTY(m.varname)
	\*       <<m.g_verti>> Variable:            <<m.varname>>
	\\<<REPLICATE(" ",35-LEN(m.varname))>><<m.g_verti>>
ENDIF
\*       <<m.g_verti>> Called By:           <<m.from+" Clause">>
\\<<REPLICATE(" ",35-LEN(m.from+" Clause"))>><<m.g_verti>>
IF Object(Objtype) <> ""
	\*       <<m.g_verti>> Object Type:
	\\         <<Object(Objtype)>>
	\\<<REPLICATE(" ",35-LEN(Object(Objtype)))>><<m.g_verti>>
ENDIF
\*       <<m.g_verti>> Snippet Number:
\\      <<ALLTRIM(STR(m.g_snippcnt,2))>>
\\<<REPLICATE(" ",35-LEN(ALLTRIM(STR(m.g_snippcnt,2))))>><<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_corn3>><<REPLICATE(m.g_horiz,57)>><<m.g_corn4>>
\*

*
* COMMENTBLOCK - Generate a comment block.
*
*!*********************************************************************
*!
*!      Procedure: COMMENTBLOCK
*!
*!      Called by: GENCLEANUP     (procedure in GENSCRN.PRG)
*!               : GENSECT1       (procedure in GENSCRN.PRG)
*!               : GENSECT2       (procedure in GENSCRN.PRG)
*!               : GENCLOSEDBFS   (procedure in GENSCRN.PRG)
*!               : GENOPENDBFS    (procedure in GENSCRN.PRG)
*!               : BUILDFMT       (procedure in GENSCRN.PRG)
*!               : PLACEREAD      (procedure in GENSCRN.PRG)
*!               : DEFWINDOWS     (procedure in GENSCRN.PRG)
*!
*!          Calls: BASENAME       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE commentblock
PARAMETER m.dbalias, m.string
PRIVATE m.msg
m.msg = basename(m.dbalias)+m.string
\
\*       <<m.g_corn1>><<REPLICATE(m.g_horiz,57)>><<m.g_corn2>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>>
\\ <<PADC(m.msg,55," ")>>
\\ <<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_corn3>><<REPLICATE(m.g_horiz,57)>><<m.g_corn4>>
\*
\

*
* GENCOMMENT - Generate a comment.
*
*!*********************************************************************
*!
*!      Procedure: GENCOMMENT
*!
*!      Called by: GENVALIDBODY   (procedure in GENSCRN.PRG)
*!               : GENWHENBODY    (procedure in GENSCRN.PRG)
*!               : ACTICLAUSE     (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!               : PLACESAYS      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE gencomment
PARAMETER m.msg
\*
\* <<m.msg>>
\*

** formfeed 
**
** General Supporting Routines
**

*
* BASENAME - returns strippath(stripext(filespec))
*
*!*********************************************************************
*!
*!      Procedure: BASENAME
*!
*!      Called by: ACTICLAUSE     (procedure in GENSCRN.PRG)
*!               : COMMENTBLOCK   (procedure in GENSCRN.PRG)
*!
*!          Calls: STRIPPATH      (procedure in GENSCRN.PRG)
*!               : STRIPEXT       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION basename
PARAMETER m.filename
RETURN strippath(stripext(m.filename))

*
* STRIPEXT - Strip the extension from a file name.
*
* Description:
* Use the algorithm employed by FoxPRO itself to strip a
* file of an extension (if any): Find the rightmost dot in
* the filename.  If this dot occurs to the right of a "\"
* or ":", then treat everything from the dot rightward
* as an extension.  Of course, if we found no dot,
* we just hand back the filename unchanged.
*
* Parameters:
* filename - character string representing a file name
*
* Return value:
* The string "filename" with any extension removed
*
*!*********************************************************************
*!
*!      Procedure: STRIPEXT
*!
*!      Called by: OPENPROJDBF()  (function  in GENSCRN.PRG)
*!               : PREPSCREENS()  (function  in GENSCRN.PRG)
*!               : GENVALIDBODY   (procedure in GENSCRN.PRG)
*!               : GENWHENBODY    (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!               : GENRELSTMTS    (procedure in GENSCRN.PRG)
*!               : BASENAME       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION stripext
PARAMETER m.filename
PRIVATE m.dotpos, m.terminator
m.dotpos = RAT(".", m.filename)
m.terminator = MAX(RAT("\", m.filename), RAT(":", m.filename))
IF m.dotpos > m.terminator
	m.filename = LEFT(m.filename, m.dotpos-1)
ENDIF
RETURN m.filename

*
* STRIPPATH - Strip the path from a file name.
*
* Description:
* Find positions of backslash in the name of the file.  If there is one
* take everything to the right of its position and make it the new file
* name.  If there is no slash look for colon.  Again if found, take
* everything to the right of it as the new name.  If neither slash
* nor colon are found then return the name unchanged.
*
* Parameters:
* filename - character string representing a file name
*
* Return value:
* The string "filename" with any path removed
*
*!*********************************************************************
*!
*!      Procedure: STRIPPATH
*!
*!      Called by: PREPSCREENS()  (function  in GENSCRN.PRG)
*!               : GENVALIDBODY   (procedure in GENSCRN.PRG)
*!               : GENWHENBODY    (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!               : GENOPENDBFS    (procedure in GENSCRN.PRG)
*!               : GENRELSTMTS    (procedure in GENSCRN.PRG)
*!               : GENWINDEFI     (procedure in GENSCRN.PRG)
*!               : BASENAME       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION strippath
PARAMETER m.filename
PRIVATE m.slashpos, m.namelen, m.colonpos
m.slashpos = RAT("\", m.filename)
IF m.slashpos > 0
	m.namelen  = LEN(m.filename) - m.slashpos
	m.filename = RIGHT(m.filename, m.namelen)
ELSE
	m.colonpos = RAT(":", m.filename)
	IF m.colonpos > 0
		m.namelen  = LEN(m.filename) - m.colonpos
		m.filename = RIGHT(m.filename, m.namelen)
	ENDIF
ENDIF
RETURN m.filename

*
* UNIQUEWIN - Check if a window name is unique.
*
*!*********************************************************************
*!
*!      Procedure: UNIQUEWIN
*!
*!      Called by: GENWINDEFI     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION uniquewin
PARAMETER m.windowname, m.windcnt, arry
PRIVATE m.found, m.i, m.first, m.middle
m.found  = .F.
m.first  = 1
m.last   = m.windcnt
m.middle = 0

IF EMPTY(arry[1,1])
	RETURN 1
ENDIF
DO WHILE (m.last >= m.first) AND NOT m.found
	m.middle = INT((m.first+m.last) / 2)
	IF m.windowname < arry[m.middle,1]
		m.last = m.middle - 1
	ELSE
		IF m.windowname > arry[m.middle,1]
			m.first = m.middle + 1
		ELSE
			m.found = .T.
		ENDIF
	ENDIF
ENDDO
IF m.found
	RETURN 0
ELSE
	RETURN m.first
ENDIF

*
* ADDTOCTRL - Generate clause code for object level cluses.
*
*!*********************************************************************
*!
*!      Procedure: ADDTOCTRL
*!
*!      Called by: ELEMRANGE      (procedure in GENSCRN.PRG)
*!               : ANYVALID       (procedure in GENSCRN.PRG)
*!               : ANYWHEN        (procedure in GENSCRN.PRG)
*!               : ANYMESSAGE     (procedure in GENSCRN.PRG)
*!               : ANYERROR       (procedure in GENSCRN.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENSCRN.PRG)
*!               : OKTOGENERATE   (procedure in GENSCRN.PRG)
*!               : ATWNAME        (procedure in GENSCRN.PRG)
*!               : NOTCOMMENT     (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE addtoctrl
PARAMETER m.procname, m.from, m.memo, m.varname
PRIVATE m.linecnt, m.count, m.textline, m.genfunction, m.notcomnt, m.at
_TEXT = m.g_tmphandle
m.genfunction = .F.
m.notcomnt = 0
m.linecnt = MEMLINES(m.memo)
_MLINE = 0
DO genfuncheader WITH m.procname, m.from, .F., m.varname
FOR m.count = 1 TO m.linecnt
	m.textline = MLINE(m.memo, 1, _MLINE)
	SET UDFPARMS TO REFERENCE
	
	IF oktogenerate(m.textline, m.notcomnt)
		IF m.notcomnt > 0 AND NOT m.genfunction
			\FUNCTION <<m.procname>>     &&  <<m.varname>> <<m.from>>
			\#REGION <<m.g_screen>>
			m.genfunction = .T.
		ENDIF
		
		IF NOT EMPTY(g_wnames[m.g_screen])
			m.at = atwname(g_wnames[m.g_screen], m.textline)
			IF m.at <> 0 AND notcomment(m.textline)
				\<<STUFF(m.textline, m.at, LEN(g_wnames[m.g_screen]), g_screens[m.g_screen,2])>>
			ELSE
				\<<m.textline>>
			ENDIF
		ELSE
			\<<m.textline>>
		ENDIF
	ENDIF
	
	SET UDFPARMS TO VALUE
ENDFOR
IF m.notcomnt = 0
	\FUNCTION <<m.procname>>     &&  <<m.varname>> <<m.from>>
ENDIF
_TEXT = m.g_orghandle

*
* OKTOGENERATE - Ok to generate this line?
*
* Description:
* Check if the code segment provided by the user for the object level
* VALID, MESSAGE, and WHEN clauses does not contain 'FUNCTION',
* 'PROCEDURE' or 'PARAMETER' statements as its first non-comment
* statements.  This is done on line by line basis.
*
*!*********************************************************************
*!
*!      Procedure: OKTOGENERATE
*!
*!      Called by: ADDTOCTRL      (procedure in GENSCRN.PRG)
*!
*!          Calls: NOTVARIABLE    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION oktogenerate
PARAMETER m.text, m.notcomnt
PRIVATE m.asterisk, m.isnote, m.proc, m.func, m.para
IF EMPTY(m.text)
	RETURN .T.
ENDIF
m.asterisk = AT("*", m.text)
m.isnote   = AT("NOTE", m.text)

IF (m.asterisk = 0 AND m.isnote = 0) OR;
		(m.asterisk <> 1 AND NOT EMPTY(SUBSTR(m.text,1,m.asterisk-1)))
	m.notcomnt = m.notcomnt + 1
	m.proc = AT("PROC", UPPER(m.text))
	m.func = AT("FUNC", UPPER(m.text))
	m.para = AT("PARA", UPPER(m.text))
	
	IF  (m.proc<>0 AND notvariable(m.proc, m.text)) OR;
			(m.func<>0 AND notvariable(m.func, m.text)) OR;
			(m.para<>0 AND notvariable(m.para, m.text))
		*
		* If the first non-comment line is a FUNCTION, PROCEDURE, or
		* a PARAMETER statement then do not generate it.
		*
		IF m.notcomnt = 1
			RETURN .F.
		ENDIF
	ENDIF
ENDIF

*
* NOTVARIABLE - Check if string found is a part of variable name.
*
*!*********************************************************************
*!
*!      Procedure: NOTVARIABLE
*!
*!      Called by: OKTOGENERATE   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
FUNCTION notvariable
PARAMETER m.pos, m.text
PRIVATE m.before, m.after, m.pos
IF m.pos-1 > 0
	m.before = SUBSTR(m.text, m.pos-1, 1)
ELSE
	RETURN .T.
ENDIF
IF m.pos+5 <= LEN(m.text)
	m.after  = SUBSTR(m.text, m.pos+5, 1)
ELSE
	RETURN .T.
ENDIF
IF m.before = M.G_UNDER OR ;
		(m.before >= '0' AND m.before <= '9') OR ;
		(m.before >= 'a' AND m.before <= 'z') OR ;
		(m.before >= 'A' AND m.before <= 'Z')
	RETURN .F.
ENDIF
IF m.after = M.G_UNDER OR ;
		(m.after >= '0' AND m.after <= '9') OR ;
		(m.after >= 'a' AND m.after <= 'z') OR ;
		(m.after >= 'A' AND m.after <= 'Z')
	RETURN .F.
ENDIF

*
* OBJECT - Return name of an object.
*
*!*********************************************************************
*!
*!      Procedure: OBJECT
*!
*!*********************************************************************
FUNCTION object
PARAMETER m.objecttype
PRIVATE m.objname
DO CASE
CASE m.objecttype = 11
	m.objname = "List"
CASE m.objecttype = 12
	m.objname = "Push Button"
CASE m.objecttype = 13
	m.objname = "Radio Button"
CASE m.objecttype = 14
	m.objname = "Check Box"
CASE m.objecttype = 15
	m.objname = "Field"
CASE m.objecttype = 16
	m.objname = "Popup"
OTHERWISE
	m.objname = ""
ENDCASE
RETURN m.objname

*
* COMBINE - Combine the original and the temp files.
*
*!*********************************************************************
*!
*!      Procedure: COMBINE
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE combine
PRIVATE m.size, m.top, m.end, m.status
m.size = FSEEK(m.g_tmphandle,0,2)
m.top  = FSEEK(m.g_tmphandle,0)
m.end  = FSEEK(m.g_orghandle,0,2)

m.status = FWRITE(m.g_orghandle,FREAD(m.g_tmphandle,m.size))
IF m.status = 0 AND m.size > 0
	DO errorhandler WITH "Unsuccessful file merge...",;
		LINENO(), M.G_ERROR_2
ENDIF

** formfeed 
**
** Code Associated With Displaying of the Thermometer
**

*
* ACTTHERM(<text>) - Activate thermometer.
*
* Activates thermometer.  Update the thermometer with UPDTHERM().
* Thermometer window is named "thermometer."  Be sure to RELEASE
* this window when done with thermometer.  Creates the global
* m.g_thermwidth.
*
*!*********************************************************************
*!
*!      Procedure: ACTTHERM
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE acttherm
PARAMETER m.text
PRIVATE m.therm_x1, m.therm_y1, m.therm_x2, m.therm_y2
m.therm_x1 = INT((SROW()-6)/2)
m.therm_y1 = INT((SCOL()-57)/2)
m.therm_x2 = m.therm_x1 + 6
m.therm_y2 = m.therm_y1 + 57

DEFINE WINDOW thermomete;
	FROM m.therm_x1, m.therm_y1 TO m.therm_x2, m.therm_y2;
	FLOAT DOUBLE COLOR SCHEME 5

ACTIVATE WINDOW thermomete
@ 0,3 SAY m.text
@ 1,3 SAY UPPER(SUBSTR(SYS(2014,m.g_outfile),1,48)+;
	IIF(LEN(m.g_outfile)>48,"...",""))
m.g_thermwidth = 54
@ 2,1 TO 4,m.g_thermwidth

*
* UPDTHERM(<percent>) - Update thermometer.
*
*!*********************************************************************
*!
*!      Procedure: UPDTHERM
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!               : BUILDCTRL      (procedure in GENSCRN.PRG)
*!               : BUILDFMT       (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE updtherm
PARAMETER m.percent
PRIVATE m.nblocks, m.percent
ACTIVATE WINDOW thermomete
m.nblocks = (m.percent/100) * (m.g_thermwidth-4)
@ 3,3 SAY REPLICATE("€",m.nblocks)

*
* DEACTTHERMO - Deactivate and Release thermometer window.
*
*!*********************************************************************
*!
*!      Procedure: DEACTTHERMO
*!
*!      Called by: BUILD          (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE deactthermo
RELEASE WINDOW Thermomete

** formfeed 
**
** Error Handling Code
**

*
* ERRORHANDLER - Error Processing Center.
*
*!*********************************************************************
*!
*!      Procedure: ERRORHANDLER
*!
*!      Called by: GENSCRN.PRG                   
*!               : OPENPROJDBF()  (function  in GENSCRN.PRG)
*!               : PREPSCREENS()  (function  in GENSCRN.PRG)
*!               : PREPFILE       (procedure in GENSCRN.PRG)
*!               : CLOSEFILE      (procedure in GENSCRN.PRG)
*!               : REFRESHPREFS   (procedure in GENSCRN.PRG)
*!               : GENVALIDBODY   (procedure in GENSCRN.PRG)
*!               : GENWHENBODY    (procedure in GENSCRN.PRG)
*!               : ACTICLAUSE     (procedure in GENSCRN.PRG)
*!               : DEATCLAUSE     (procedure in GENSCRN.PRG)
*!               : SHOWCLAUSE     (procedure in GENSCRN.PRG)
*!               : GENOPENDBFS    (procedure in GENSCRN.PRG)
*!               : DOPLACECLAUSE  (procedure in GENSCRN.PRG)
*!               : FINDREADCLAUSES(procedure in GENSCRN.PRG)
*!               : GENWINDEFI     (procedure in GENSCRN.PRG)
*!               : COMBINE        (procedure in GENSCRN.PRG)
*!
*!          Calls: CLEANUP        (procedure in GENSCRN.PRG)
*!               : ERRLOG         (procedure in GENSCRN.PRG)
*!               : ERRSHOW        (procedure in GENSCRN.PRG)
*!               : CLOSEFILE      (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE errorhandler
PARAMETERS m.msg, m.linenum, errcode
IF ERROR() = 22
	ON ERROR
	RELEASE M.G_OTSCREEN, M.G_OTWORKAREA, M.G_OTINDEX, ;
		M.G_OTREL, M.G_OTTEXT, M.G_OTBOX, M.G_OTLIST, M.G_OTTXTBUT, ;
		M.G_OTRADBUT, M.G_OTCHKBOX, M.G_OTFIELD, M.G_OTPOPUP, ;
		M.G_OTINVBUT, M.G_AUTHORLEN, M.G_COMPLEN, M.G_ADDRLEN, ;
		M.G_CITYLEN, M.G_STATLEN, M.G_ZIPLEN, M.G_SGSAY, M.G_SGGET, ;
		M.G_SGEDIT, M.G_SGFROM, M.G_SGBOX, M.G_SGBOXD, M.G_SGBOXP, ;
		M.G_SGBOXC, M.G_MAXDBFS, M.G_MAXWINDS, M.G_MAXPOPS, ;
		M.G_MAXSCREENS, M.G_ESC, M.G_NULL, M.G_CRET, M.G_UNDER, ;
		M.G_SINGLE, M.G_DOUBLE, M.G_PANEL, M.G_FROMONE, M.G_UNTILEND, ;
		M.G_ERROR_1, M.G_ERROR_2, M.G_ERROR_3
	
	DO cleanup
	CANCEL
ENDIF

DO CASE
CASE errcode == "Minor"
	DO errlog WITH m.msg, m.linenum
	m.g_status = 1
CASE errcode == "Serious"
	DO errlog  WITH m.msg, m.linenum
	DO errshow WITH m.msg, m.linenum
	m.g_status = 2
	ON ERROR
CASE errcode == "Fatal"
	IF m.g_havehandle
		DO errlog WITH m.msg, m.linenum
		DO closefile WITH m.g_orghandle
		DO closefile WITH m.g_tmphandle
	ENDIF
	DO errshow WITH m.msg, m.linenum
	IF WEXIST("Thermomete") AND WVISIBLE("Thermomete")
		RELEASE WINDOW Thermometer
	ENDIF
	ON ERROR
	DO cleanup
	CANCEL
ENDCASE

*
* ESCHANDLER - Escape handler.
*
*!*********************************************************************
*!
*!      Procedure: ESCHANDLER
*!
*!      Called by: BUILDENABLE    (procedure in GENSCRN.PRG)
*!
*!          Calls: BUILDDISABLE   (procedure in GENSCRN.PRG)
*!               : CLEANUP        (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE eschandler
ON ERROR
WAIT WINDOW "Generation process stopped." NOWAIT
DO builddisable
IF m.g_havehandle
	ERASE (m.g_outfile)
	ERASE (m.g_tmpfile)
ENDIF
IF WEXIST("Thermomete") AND WVISIBLE("Thermomete")
	RELEASE WINDOW Thermometer
ENDIF
DO cleanup
CANCEL

*
* ERRLOG - Save an error message in the error log file.
*
*!*********************************************************************
*!
*!      Procedure: ERRLOG
*!
*!      Called by: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!
*!          Calls: OPENERRFILE    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE errlog
PARAMETER m.msg, m.linenum
DO openerrfile

SET CONSOLE OFF
\\GENERATOR: <<ALLTRIM(m.msg)>>
IF NOT EMPTY(m.linenum)
	\\ LINE NUMBER: <<m.linenum>>
ENDIF
\
= FCLOSE(_TEXT)
_TEXT = m.g_orghandle

*
* ERRSHOW - Show error in an alert box on the screen.
*
*!*********************************************************************
*!
*!      Procedure: ERRSHOW
*!
*!      Called by: ERRORHANDLER   (procedure in GENSCRN.PRG)
*!               : OPENERRFILE    (procedure in GENSCRN.PRG)
*!
*!*********************************************************************
PROCEDURE errshow
PARAMETER m.msg, m.lineno
PRIVATE m.fromrow, m.fromcol, m.torow, m.tocol
m.fromrow = INT((SROW()-6)/2)
m.fromcol = INT((SCOL()-50)/2)
m.torow   = m.fromrow + 6
m.tocol   = m.fromcol + 50

DEFINE WINDOW alert;
	FROM m.fromrow, m.fromcol TO m.torow, m.tocol;
	FLOAT NOGROW NOCLOSE NOZOOM	SHADOW DOUBLE;
	COLOR SCHEME 7

ACTIVATE WINDOW alert

@ 0,0 CLEAR
@ 1,0 SAY PADC(SUBSTR(m.msg,1,44)+;
	IIF(LEN(m.msg)>44,"...",""), WCOLS())
@ 2,0 SAY PADC("Line Number: "+STR(m.lineno, 4), WCOLS())
@ 3,0 SAY PADC("Press any key to cleanup and exit...", WCOLS())
WAIT ""

RELEASE WINDOW alert

*
* OPENERRFILE - Open error file.
*
*!*********************************************************************
*!
*!      Procedure: OPENERRFILE
*!
*!      Called by: ERRLOG         (procedure in GENSCRN.PRG)
*!
*!          Calls: ERRSHOW        (procedure in GENSCRN.PRG)
*!
*!    Other Files: M.ERRFILE
*!
*!*********************************************************************
PROCEDURE openerrfile
PRIVATE m.errfile, m.errhandle
m.errfile   = m.g_errlog+".ERR"
m.errhandle = FOPEN(m.errfile,2)
IF m.errhandle < 0
	m.errhandle = FCREATE(m.errfile)
	IF m.errhandle < 0
		DO errshow WITH ".ERR could not be opened...", LINENO()
		m.g_status = 2
		IF WEXIST("Thermomete") AND WVISIBLE("Thermomete")
			RELEASE WINDOW Thermometer
		ENDIF
		ON ERROR
		RETURN TO MASTER
	ENDIF
ELSE
	= FSEEK(m.errhandle,0,2)
ENDIF
IF SET("TEXTMERGE") = "OFF"
	SET TEXTMERGE ON
ENDIF
_TEXT = m.errhandle

*: EOF: GENSCRN.PRG
