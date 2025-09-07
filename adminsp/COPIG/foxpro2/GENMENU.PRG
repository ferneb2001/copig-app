*:*********************************************************************
*:
*: Procedure file: C:\PRO20\GENMENU.PRG
*:
*:         System: GENMENU.PRG
*:         Author: Fox Software Systems Group
*:      Copyright (c) 1991, Fox Software, Inc.
*:  Last modified: 07/01/91     11:26
*:
*:  Procs & Fncts: ERRORHANDLER
*:               : SETUP
*:               : VALIDPARAMS()
*:               : ESCHANDLER
*:               : REFRESHPREFS
*:               : BUILD
*:               : CLEANUP
*:               : SUBDEVINFO
*:               : BUILDENABLE
*:               : BUILDDISABLE
*:               : OPENDB
*:               : ILLEGALNAME
*:               : OPENFILE
*:               : DEFINEMENU
*:               : DEFMENUPADS
*:               : DEFONPAD
*:               : DEFINEPOPUPS
*:               : DEFBARS
*:               : DEFONBAR
*:               : GLOBALDEFAULTS
*:               : ADDMARK
*:               : ADDKEY
*:               : ADDSKIPFOR
*:               : HEADER
*:               : GENFUNCHEADER
*:               : REMOVEMETA
*:               : COMMENTBLOCK
*:               : ONSELECTION
*:               : GENSNIPPNAME
*:               : GENPROCCALL
*:               : SINGLELINE
*:               : GENPROCEDURES
*:               : WRITECODE
*:               : GENSETUPCLEANUP
*:               : STRIPEXT
*:               : STRIPPATH
*:               : BASENAME
*:               : ACTTHERM
*:               : UPDTHERM
*:               : DEACTTHERMO
*:               : ERRLOG
*:               : ERRSHOW
*:               : OPENERRFILE
*:
*:          Calls: ERRORHANDLER   (procedure in GENMENU.PRG)
*:               : SETUP          (procedure in GENMENU.PRG)
*:               : VALIDPARAMS()  (function  in GENMENU.PRG)
*:               : ESCHANDLER     (procedure in GENMENU.PRG)
*:               : REFRESHPREFS   (procedure in GENMENU.PRG)
*:               : BUILD          (procedure in GENMENU.PRG)
*:               : CLEANUP        (procedure in GENMENU.PRG)
*:
*:      Documented 07/01/91 at 12:22               FoxDoc  version 2.10
*:*********************************************************************
*
* MENUGEN - Menu code generator.
*
* Fox Software Systems Group
*
* Copyright (c) 1990 Fox Software, Inc.
* 134 W. South Boundary
* Perrysburg, Ohio  43551
*
* Description:
* This program generates menu code which was designed in the
* FoxPro 2.0 MENU BUILDER.
*
* Notes:
* In this program, for clarity/readability reasons, we use variable
* names that are longer than 10 characters.  Note, however, that only
* the first 10 characters are significant.
*
* Modification History:
* December 13, 1990		JAC		Program Created
*
PARAMETER m.projdbf, m.recno

IF SET("TALK") = "ON"
	SET TALK OFF
	m.talkstate = "ON"
ELSE
	m.talkstate = "OFF"
ENDIF
m.escape = SET("ESCAPE")
SET ESCAPE OFF
m.trbetween = SET("TRBET")
SET TRBET OFF
m.comp = SET("COMPATIBLE")
SET COMPATIBLE OFF

*
* Declare Constants
*
M.G_ESC    	= CHR(27)
M.G_NULL    = CHR(0)
M.G_GLOBAL	= 1
M.G_SUBMENU = 2
M.G_ITEM    = 3
M.G_MENU    = 1
M.G_PROC    = 80

M.G_MAXSNIPPETS = 25
M.G_MAXPADS     = 25

M.G_AUTHORLEN = 45
M.G_COMPLEN	= 45
M.G_ADDRLEN	= 45
M.G_CITYLEN	= 20
M.G_STATLEN	= 2
M.G_ZIPLEN	= 10

M.G_ERROR_1 = "Minor"
M.G_ERROR_2 = "Serious"
M.G_ERROR_3 = "Fatal"

M.G_REPLACE = 0
M.G_APPEND  = 1
M.G_BEFORE  = 2
M.G_AFTER   = 3

*
* Declare Variables
*
STORE "" TO m.cursor, m.consol, m.bell, m.exact, m.safety, m.fixed, m.print
STORE 0 TO m.deci, m.memowidth

m.g_error      = .F.
m.g_errlog     = ""
m.g_homedir    = ""
m.g_location   = 0
m.g_menucolor  = 0
m.g_menumark   = ""
m.g_nohandle   = .T.
m.g_nsnippets  = 0
m.g_outfile    = ""
m.g_padloca    = ""
m.g_projalias  = ""
m.g_projdbf    = m.projdbf
m.g_projpath   = ""
m.g_status     = 0
m.g_snippcnt   = 0
m.g_thermwidth = 0
m.g_workarea   = 0

m.g_devauthor  = PADR("Author's Name",45," ")
m.g_devcompany = PADR("Company Name",45, " ")
m.g_devaddress = PADR("Address",45," ")
m.g_devcity    = PADR("City",20," ")
m.g_devstate   = "  "
m.g_devzip     = PADR("Zip",10," ")

STORE "*" TO m.g_corn1, m.g_corn2, m.g_corn3, m.g_corn4,;
	m.g_corn5, m.g_corn6, m.g_horiz, m.g_verti

*
* Array Declarations
*
* g_mnxfile [1] - Normalized path + name
* g_mnxfile [2] - Basename
* g_mnxfile [3] - Opened originally?
* g_mnxfile [4] - Alias
*
DIMENSION g_mnxfile[4]
g_mnxfile[1] = ""
g_mnxfile[2] = ""
g_mnxfile[3] = .F.
g_mnxfile[4] = ""

*
* g_pads - names of generated menu pads
*
DIMENSION g_pads[M.G_MAXPADS]

*
* g_snippets [*,1] - generated snippet procedure name
* g_snippets [*,2] - recno()
*
DIMENSION g_snippets [M.G_MAXSNIPPETS,2]
g_snippets = ""

* formfeed 
*
* Main program
*
ON ERROR DO errorhandler WITH MESSAGE(), LINENO(), M.G_ERROR_3

IF PARAMETERS()=2
	DO setup
	IF validparams()
		ON ESCAPE DO eschandler
		SET ESCAPE ON
		DO refreshprefs
		DO build
	ENDIF
	DO cleanup
ELSE
	DO errorhandler WITH "Invalid number of parameters passed to"+;
		" the generator",LINENO(),M.G_ERROR_3
ENDIF

IF m.talkstate = "ON"
	SET TALK ON
ENDIF
IF m.comp = "ON"
	SET COMPATIBLE ON
ENDIF
IF m.escape = "ON"
	SET ESCAPE ON
ELSE
	SET ESCAPE OFF
ENDIF
IF m.trbetween = "ON"
	SET TRBET ON
ELSE
	SET TRBET OFF
ENDIF
ON ERROR

RETURN m.g_status

* formfeed 

**
** Setup, Cleanup, Validparams, and Refreshprefs of Main Program
**

*
* STARTUP - Create program's environment.
*
* Description:
* Save the user's environment so that we can set it back when
* we are done, then issue various SET commands. The only state
* we cannot conveniently save is SET TALK, because storing the
* state involves an assignment statement, and assignments
* generate unwanted output if TALK is set ON.
*
* Side Effects:
* Creates a temporary file which is deleted in the Cleanup
* procedure executed at the end of MENUGEN.
*
*!*********************************************************************
*!
*!      Procedure: SETUP
*!
*!      Called by: GENMENU.PRG                   
*!
*!*********************************************************************
PROCEDURE setup
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
m.print = SET("PRINT")
SET PRINT OFF

*
* CLEANUP - restore environment to pre-execution state.
*
* Description:
* Close all databases opened in the course of the execution of MENUGEN.
* Restore the environment to the pre-execution of MENUGEN.  Delete
* the VIEW file since there is no further use for it.
*
* Side Effects:
* Closes databases.
* Deletes the temporary view file.
*
*!*********************************************************************
*!
*!      Procedure: CLEANUP
*!
*!      Called by: GENMENU.PRG                   
*!               : ERRORHANDLER   (procedure in GENMENU.PRG)
*!               : ESCHANDLER     (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE cleanup
IF EMPTY(m.g_projalias)
	RETURN
ENDIF
SELECT (m.g_projalias)
USE
IF NOT EMPTY(g_mnxfile[3])
	IF USED(g_mnxfile[4])
		SELECT (g_mnxfile[4])
		USE
	ENDIF
ENDIF
SELECT (m.g_workarea)

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
IF m.print = "ON"
	SET PRINT ON
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

*
* VALIDPARAMS - Validate generator parameters.
*
* Description:
* Attempt to open the project database.  If error encountered then
* on error routine takes over and issues 'CANCEL'.  The output file
* cannot be erased, name not known.
*
*!*********************************************************************
*!
*!       Function: VALIDPARAMS()
*!
*!      Called by: GENMENU.PRG                   
*!
*!          Calls: STRIPEXT       (procedure in GENMENU.PRG)
*!               : ERRORHANDLER   (procedure in GENMENU.PRG)
*!               : BASENAME       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION validparams
SELECT 0
m.g_projalias = IIF(USED("projdbf"),"P"+;
	SUBSTR(LOWER(SYS(3)),2,8),"projdbf")
USE (m.projdbf) ALIAS (m.g_projalias)
m.g_errlog = stripext(m.projdbf)
m.g_projpath = SUBSTR(m.projdbf,1,RAT("\",m.projdbf))

IF FCOUNT() <> 33
	DO errorhandler WITH "Generator out of date.",;
		LINENO(), M.G_ERROR_2
	RETURN .F.
ENDIF

GOTO RECORD m.recno

m.g_outfile = ALLTRIM(SUBSTR(Outfile,1,AT(M.G_NULL,Outfile)-1))
m.g_outfile = FULLPATH(m.g_outfile, m.g_projpath)
g_mnxfile[1] = FULLPATH(ALLTRIM(Name), m.g_projpath)
g_mnxfile[2] = basename(g_mnxfile[1])

*
* REFRESHPREFS - Refresh comment style and developer preferences.
*
* Description:
* Get the newest preferences for documentation style and developer
* data from the project database.
*
*!*********************************************************************
*!
*!      Procedure: REFRESHPREFS
*!
*!      Called by: GENMENU.PRG                   
*!
*!          Calls: ERRORHANDLER   (procedure in GENMENU.PRG)
*!               : SUBDEVINFO     (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE refreshprefs
PRIVATE m.start, m.savrecno
m.savrecno = RECNO()
LOCATE FOR Type = "H"
IF NOT FOUND ()
	DO errorhandler WITH "Missing header record in "+m.g_projdbf,;
		LINENO(), M.G_ERROR_2
	GOTO RECORD m.savrecno
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
	m.g_corn1 = "Ö"
	m.g_corn2 = "·"
	m.g_corn3 = "Ó"
	m.g_corn4 = "½"
	m.g_corn5 = "Ç"
	m.g_corn6	= "¶"
	m.g_horiz = "Ä"
	m.g_verti = "º"
ENDIF
GOTO RECORD m.savrecno

*
* SUBDEVINFO - Substring the DEVINFO memo filed.
*
*!*********************************************************************
*!
*!      Procedure: SUBDEVINFO
*!
*!      Called by: REFRESHPREFS   (procedure in GENMENU.PRG)
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
** Menu Code Generator's Main Module.
**

*
* BUILD - Generate code for a menu.
*
* Description:
* Call BUILDENABLE to open .MNX database specified by the user.
* If the above is successfully accomplished, then proceed to generate
* the menu code.  After the menu code is generated, call BUILDDISABLE
* to disable code generation between SET TEXTMERGE ON and
* SET TEXTMERGE OFF.
*
*!*********************************************************************
*!
*!      Procedure: BUILD
*!
*!      Called by: GENMENU.PRG                   
*!
*!          Calls: BUILDENABLE    (procedure in GENMENU.PRG)
*!               : ACTTHERM       (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!               : HEADER         (procedure in GENMENU.PRG)
*!               : GENSETUPCLEANUP(procedure in GENMENU.PRG)
*!               : DEFINEMENU     (procedure in GENMENU.PRG)
*!               : DEFINEPOPUPS   (procedure in GENMENU.PRG)
*!               : GLOBALDEFAULTS (procedure in GENMENU.PRG)
*!               : GENPROCEDURES  (procedure in GENMENU.PRG)
*!               : BUILDDISABLE   (procedure in GENMENU.PRG)
*!               : DEACTTHERMO    (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE build
IF NOT buildenable()
	RETURN
ENDIF
DO acttherm WITH "Generating Menu Code..."
DO updtherm WITH 10

DO header
DO gensetupcleanup WITH "setup"
DO definemenu
DO definepopups
DO globaldefaults
DO gensetupcleanup WITH "cleanup"
DO genprocedures

DO builddisable
DO updtherm WITH 100
DO deactthermo

* formfeed 
*
* BUILDENABLE - Enable code generation.
*
* Description:
* Call opendb to open .MNX database.
* Call openfile to open file to hold the generated program.
* If error(s) encountered in opendb or openfile then don't do
* anything and exit, otherwise enable code generation with the
* SET TEXTMERGE ON command.
*
* Returns:
* .T. on success; .F. on failure
*
*!*********************************************************************
*!
*!      Procedure: BUILDENABLE
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: OPENDB         (procedure in GENMENU.PRG)
*!               : OPENFILE       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION buildenable
PRIVATE m.stat
m.stat = opendb(g_mnxfile[1]) AND openfile()
IF m.stat
	SET TEXTMERGE ON
ENDIF
RETURN m.stat

*
* BUILDDISABLE - Disable code generation.
*
* Description:
* Issue the command SET TEXTMERGE OFF.
* Close the generated menu code output file.
* If anything goes wrong display appropriate message to the user.
*
*!*********************************************************************
*!
*!      Procedure: BUILDDISABLE
*!
*!      Called by: ESCHANDLER     (procedure in GENMENU.PRG)
*!               : BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE builddisable
SET ESCAPE OFF
ON ESCAPE
SET TEXTMERGE OFF
IF NOT FCLOSE(_TEXT)
	DO errorhandler WITH "Unable to Close the Application File",;
		LINENO(), M.G_ERROR_2
ENDIF

* formfeed 
*
* OPENDB - Prepare database for processing.
*
* Description:
* Attempt to USE a database.  If attempt fails and error is reported
* call ERRORHANDLER routine to display a friendly message.  Return
* with a status of .F..  If attempt succeeds, return with status of .T.
*
* Returns:
* .T. on success; .F. on failure
*
*!*********************************************************************
*!
*!      Procedure: OPENDB
*!
*!      Called by: BUILDENABLE    (procedure in GENMENU.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENMENU.PRG)
*!               : STRIPPATH      (procedure in GENMENU.PRG)
*!               : STRIPEXT       (procedure in GENMENU.PRG)
*!               : ILLEGALNAME    (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION opendb
PARAMETER m.dbname
PRIVATE m.dbalias
ON ERROR DO errorhandler WITH MESSAGE(), LINENO(), M.G_ERROR_2

m.dbalias = basename(m.dbname)
IF USED (m.dbalias)
	SELECT (m.dbalias)
	IF AT(".MNX",DBF())<>0
		g_mnxfile[3] = .F.
		g_mnxfile[4] = m.dbalias
	ELSE
		g_mnxfile[4] = "M"+SUBSTR(LOWER(SYS(3)),2,8)
		SELECT 0
		USE (m.dbname) AGAIN ALIAS (g_mnxfile[4])
		g_mnxfile[3] = .T.
	ENDIF
ELSE
	IF illegalname(m.dbalias) OR m.dbalias=basename(m.dbname)
		g_mnxfile[4] = "M"+SUBSTR(LOWER(SYS(3)),2,8)
	ELSE
		g_mnxfile[4] = m.dbalias
	ENDIF
	SELECT 0
	USE (m.dbname) AGAIN ALIAS (g_mnxfile[4])
	g_mnxfile[3] = .T.
ENDIF

ON ERROR DO errorhandler WITH MESSAGE(), LINENO(), M.G_ERROR_3
IF m.g_error = .T.
	RETURN .F.
ENDIF

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
*!      Called by: OPENDB         (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION illegalname
PARAMETER menuname
PRIVATE m.start, m.aschar, m.length
m.length = LEN(menuname)
m.start  = 0
DO WHILE m.start < m.length
	m.start  = m.start + 1
	m.aschar = ASC(SUBSTR(menuname, m.start, 1))
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
* OPENFILE - Create and open the application output file.
*
* Description:
* Create a file that will hold the generated menu code.
* Open the newly created file.  If error(s) encountered
* at any time issue an error message and return .F.
*
* Returns:
* .T. on success; .F. on failure
*
*!*********************************************************************
*!
*!      Procedure: OPENFILE
*!
*!      Called by: BUILDENABLE    (procedure in GENMENU.PRG)
*!
*!          Calls: ERRORHANDLER   (procedure in GENMENU.PRG)
*!
*!    Other Files: M.G_OUTFILE
*!
*!*********************************************************************
FUNCTION openfile
PRIVATE m.msg
_TEXT = FCREATE(m.g_outfile)
IF (_TEXT = -1)
	m.msg = "Cannot open file "+m.g_outfile
	DO errorhandler WITH m.msg, LINENO(), M.G_ERROR_3
	m.g_nohandle = .T.
	RETURN .F.
ENDIF
m.g_nohandle = .F.

* formfeed 
*
* DEFINEMENU - Define main menu and its pads.
*
* Description:
* Issue DEFINE MENU ... command.
* Call a procedure to define all menu pads.
* Call a procedure to generate ON PAD statements when appropriate.
*
*!*********************************************************************
*!
*!      Procedure: DEFINEMENU
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENMENU.PRG)
*!               : DEFMENUPADS    (procedure in GENMENU.PRG)
*!               : DEFONPAD       (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE definemenu
DO commentblock WITH "menu"
SELECT (g_mnxfile[4])
LOCATE FOR Objtype = M.G_MENU
m.g_location = Location
m.g_padloca  = ALLTRIM(Name)

LOCATE FOR Objtype = M.G_SUBMENU AND Objcode = M.G_GLOBAL

m.g_menucolor = Scheme
m.g_menumark  = Mark
IF m.g_location = M.G_REPLACE
	\SET SYSMENU TO
	\
ENDIF
\SET SYSMENU AUTOMATIC
\

DO defmenupads
DO defonpad
\
DO updtherm WITH 25

* formfeed 
*
* DEFMENUPADS - Define all pads for the menu bar.
*
* Description:
* Scan the menu database for all objects of the type item which
* have the levelname=_MSYSMENU.
* For each such item, generate a statement DEFINE PAD... where
* the name of the pad is the contents of NAME field or (if Name
* field is empty) an automatically generated name.
* Call procedures addkey, addskipfor, and mark to generate
* KEY, SKIPFOR, or MARK clauses when appropriate.
*
*!*********************************************************************
*!
*!      Procedure: DEFMENUPADS
*!
*!      Called by: DEFINEMENU     (procedure in GENMENU.PRG)
*!
*!          Calls: ADDKEY         (procedure in GENMENU.PRG)
*!               : ADDSKIPFOR     (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE defmenupads
PRIVATE m.padname, m.prompt, m.name
SCAN FOR Objtype=M.G_ITEM AND Levelname="_MSYSMENU"
	IF NOT EMPTY(Name)
		m.name = Name
		\DEFINE PAD <<m.name>> OF _MSYSMENU
	ELSE
		g_pads[VAL(Itemnum)] = LOWER(SYS(2015))
		\DEFINE PAD <<g_pads[VAL(Itemnum)]>> OF _MSYSMENU
		IF MOD(VAL(Itemnum),25)=0
			DIMENSION g_pads[VAL(Itemnum)+25]
		ENDIF
	ENDIF
	m.prompt = SUBSTR(Prompt,1,LEN(Prompt))
	\\ PROMPT "<<m.prompt>>"
	\\ COLOR SCHEME <<m.g_menucolor>>
	
	IF m.g_menumark<>M.G_NULL AND m.g_menumark<>""
		\\ ;
		\	MARK "<<m.g_menumark>>"
	ENDIF
	
	DO CASE
	CASE m.g_location = M.G_BEFORE
		\\ ;
		\	BEFORE <<m.g_padloca>>
	CASE m.g_location = M.G_AFTER
		\\ ;
		IF VAL(Itemnum) = 1
			\	AFTER <<m.g_padloca>>
		ELSE
			\	AFTER <<g_pads[VAL(Itemnum)-1]>>
		ENDIF
	ENDCASE
	
	DO addkey
	DO addskipfor
	
ENDSCAN
DO updtherm WITH 35

*
* DEFONPAD - Generate ON PAD... statements.
*
* Description:
* Generate ON PAD statements for each pad off of the main menu which
* has a submenu associated with it.
* For pads which have no submenus, but there is a command associated
* with them, issue ON SELECTION PAD... statements.  If the code
* associated with a pad is a snippet, then issue a call to the
* generated procedure and place the snippet code in it.
*
*!*********************************************************************
*!
*!      Procedure: DEFONPAD
*!
*!      Called by: DEFINEMENU     (procedure in GENMENU.PRG)
*!
*!          Calls: ONSELECTION    (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE defonpad
PRIVATE m.padname
SCAN FOR Objtype=M.G_ITEM AND Levelname="_MSYSMENU"
	IF NOT EMPTY(Name)
		m.padname = Name
	ELSE
		m.padname = g_pads[VAL(Itemnum)]
	ENDIF
	SKIP
	IF Objtype=M.G_SUBMENU AND Numitems<>0
		\ON PAD <<m.padname>> OF _MSYSMENU
		\\ ACTIVATE POPUP <<LOWER(Name)>>
		SKIP -1
	ELSE
		SKIP -1
		DO onselection WITH "pad", m.padname, '_MSYSMENU'
	ENDIF
ENDSCAN
DO updtherm WITH 45

* formfeed 
*
* DEFINEPOPUPS - Define popups and their bars.
*
* Description:
* Scan the Menu database to find all objecttypes = submenu.
* They all correspond to popups.  For each such object found, issue
* command DEFINE POPUP....  Add MARK, KEY, and SKIP FOR clauses
* if appropriate by calling procedures to handle these tasks.  Call
* procedure Defbars to define all bars of each popup.
*
*!*********************************************************************
*!
*!      Procedure: DEFINEPOPUPS
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: ADDMARK        (procedure in GENMENU.PRG)
*!               : ADDKEY         (procedure in GENMENU.PRG)
*!               : DEFBARS        (procedure in GENMENU.PRG)
*!               : DEFONBAR       (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE definepopups
PRIVATE m.savrecno, m.popname, m.sch
SCAN FOR Objtype=M.G_SUBMENU AND Levelname<>"_MSYSMENU" ;
		AND Numitems <> 0
	
	m.savrecno = RECNO()
	m.popname  = ALLTRIM(LOWER(Levelname))
	m.sch      = Scheme
	
	\DEFINE POPUP <<LOWER(Name)>> MARGIN RELATIVE SHADOW
	\\ COLOR SCHEME <<m.sch>>
	
	DO addmark
	DO addkey
	DO defbars WITH m.popname, Numitems
	DO defonbar WITH m.popname
	\
	GOTO RECORD m.savrecno
ENDSCAN
DO updtherm WITH 65

* formfeed 
*
* DEFBARS - Define bars for each popup.
*
* Description:
* Scan the menu database for all objects of the type item whose
* name equals to the current popup name.
* For each such item, generate a statement DEFINE BAR....
* Call procedures addkey, addskipfor, and addmark to generate
* KEY, SKIPFOR, or MARK clauses when appropriate.
*
*!*********************************************************************
*!
*!      Procedure: DEFBARS
*!
*!      Called by: DEFINEPOPUPS   (procedure in GENMENU.PRG)
*!
*!          Calls: ADDMARK        (procedure in GENMENU.PRG)
*!               : ADDKEY         (procedure in GENMENU.PRG)
*!               : ADDSKIPFOR     (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE defbars
PARAMETER m.popname, m.howmany, m.name
PRIVATE m.itemno, m.prompt
SCAN FOR Objtype=M.G_ITEM AND LOWER(Levelname)=m.popname
	m.itemno = ALLTRIM(Itemnum)
	
	IF NOT EMPTY(Name)
		m.name = Name
		\DEFINE BAR <<m.name>> OF <<LOWER(m.popname)>>
	ELSE
		\DEFINE BAR <<m.itemno>> OF <<LOWER(m.popname)>>
	ENDIF
	m.prompt = SUBSTR(Prompt, 1,LEN(Prompt))
	\\ PROMPT "<<m.prompt>>"
	
	DO addmark
	DO addkey
	DO addskipfor
	
	IF VAL(m.itemno)=m.howmany
		DO updtherm WITH 75
		RETURN
	ENDIF
ENDSCAN

*
* DEFONBAR - Generate ON BAR... statements.
*
* Description:
* Generate ON BAR statements for each popup.
* For bars which have no submenus, but there is a command associated
* with them, issue ON SELECTION BAR... statements.  If a snippet is
* associated with the code then generate a call statement to the
* generated procedure containing the snippet code.
*
*!*********************************************************************
*!
*!      Procedure: DEFONBAR
*!
*!      Called by: DEFINEPOPUPS   (procedure in GENMENU.PRG)
*!
*!          Calls: ONSELECTION    (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE defonbar
PARAMETER m.popname
PRIVATE m.itemno
SCAN FOR Objtype=M.G_ITEM AND LOWER(Levelname)=m.popname
	m.itemno = ALLTRIM(Itemnum)
	SKIP
	IF Objtype=M.G_SUBMENU AND Numitems<>0
		\ON BAR <<m.itemno>> OF <<LOWER(m.popname)>>
		\\ ACTIVATE POPUP <<LOWER(Name)>>
		SKIP -1
	ELSE
		SKIP -1
		DO onselection WITH "BAR", m.itemno, m.popname
	ENDIF
ENDSCAN
DO updtherm WITH 85

* formfeed 
*
* GLOBALDEFAULTS - Generate global default statements
*
* Description:
* Search the menu database for information needed to generate any of
* the following commands:
* ON SELECTION MENU <name> DO <action>
* ON SELECTION POPUP ALL DO <action>
* ON SELECTION POPUP <name> DO <action>
* It is possible that none of the above mentioned statements will be
* generated.  It is also possible that the action is a snippet of
* code and a call to the generated procedure containing the snippet
* will be generated.
*
* First try to generate ON SELECTION MENU...
* Then try to generate ON POPUP ALL...
* Lastly, try to generate ON SELECTION POPUP...
*
*!*********************************************************************
*!
*!      Procedure: GLOBALDEFAULTS
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: GENPROCCALL    (procedure in GENMENU.PRG)
*!               : UPDTHERM       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE globaldefaults
LOCATE FOR Objtype = M.G_MENU
m.mrk = Mark
IF FOUND() AND Mark <> ""
	IF Mark = M.G_NULL
		\SET MARK OF MENU _MSYSMENU TO " "
	ELSE
		\SET MARK OF MENU _MSYSMENU TO "<<Mark>>"
	ENDIF
ENDIF
IF FOUND() AND NOT EMPTY(Procedure)
	\ON SELECTION MENU _MSYSMENU
	DO genproccall
ENDIF
LOCATE FOR Objtype = M.G_SUBMENU AND Objcode = M.G_GLOBAL
IF FOUND() AND NOT EMPTY(Procedure)
	\ON SELECTION POPUP ALL
	DO genproccall
ENDIF
SCAN FOR (Objtype=M.G_SUBMENU AND Levelname<>"_MSYSMENU";
		AND NOT EMPTY(Procedure))
	\ON SELECTION POPUP <<ALLTRIM(LOWER(Levelname))>>
	DO genproccall
ENDSCAN
DO updtherm WITH 95

** formfeed 
**
** Subroutines for processing menu clause options.
**

*
* ADDMARK - Generate a MARK clause whenever appropriate.
*
* Description:
* Add a MARK clause to the current PAD or BAR definition.
* If a field named Mark is not empty, then add the continuation
* character, ";", to the previous line, and then add the MARK... clause.
*
*!*********************************************************************
*!
*!      Procedure: ADDMARK
*!
*!      Called by: DEFINEPOPUPS   (procedure in GENMENU.PRG)
*!               : DEFBARS        (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE addmark
IF Mark<>M.G_NULL AND Mark<>""
	\\ ;
	\	MARK "<<Mark>>"
ENDIF

*
* ADDKEY - Generate KEY... clause whenever appropriate.
*
* Description:
* Add a KEY clause to the current PAD or BAR definition.
* If a field named Keyname is not empty, then add the continuation
* character, ";", to the previous line, and then add the KEY... clause.
*
*!*********************************************************************
*!
*!      Procedure: ADDKEY
*!
*!      Called by: DEFMENUPADS    (procedure in GENMENU.PRG)
*!               : DEFINEPOPUPS   (procedure in GENMENU.PRG)
*!               : DEFBARS        (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE addkey
IF NOT EMPTY(Keyname)
	\\ ;
	\	KEY <<Keyname>>, "<<Keylabel>>"
ENDIF

*
* ADDSKIPFOR - Generate SKIP FOR... clause whenever appropriate.
*
* Description:
* Add a ADDSKIPFOR clause to the current PAD or BAR definition.
* If a field named Addskipfor is not empty, then add the continuation
* character, ";", to the previous line, and then add the SKIP FOR...
* clause.
*
*!*********************************************************************
*!
*!      Procedure: ADDSKIPFOR
*!
*!      Called by: DEFMENUPADS    (procedure in GENMENU.PRG)
*!               : DEFBARS        (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE addskipfor
PRIVATE m.skip
m.skip = Skipfor
IF NOT EMPTY(Skipfor)
	\\ ;
	\	SKIP FOR <<m.skip>>
ENDIF

* formfeed 
*
* HEADER - Generate generated program's header.
*
* Description:
* As a part of the automatically generated program's header generate
* program name, name of the author of the program, copyright notice,
* company name and address, and the word 'Description:' which will be
* followed with a short description of the generated code.
*
*!*********************************************************************
*!
*!      Procedure: HEADER
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE header
\\*       <<m.g_corn1>><<REPLICATE(m.g_horiz,57)>><<m.g_corn2>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> <<DATE()>>
\\<<PADC(UPPER(ALLTRIM(strippath(m.g_outfile))),IIF(SET("CENTURY")="ON",35,37))," ")>>
\\ <<TIME()>>  <<m.g_verti>>
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
\\ This program was automatically generated by GENMENU.
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
*!      Called by: GENPROCEDURES  (procedure in GENMENU.PRG)
*!
*!          Calls: REMOVEMETA     (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE genfuncheader
PARAMETER m.procname
PRIVATE m.place, m.prompt
m.g_snippcnt = m.g_snippcnt + 1
DO CASE
CASE Objtype = 1
	m.place = "ON SELECTION MENU _MSYSMENU"
CASE Objtype = 2 AND Objcode = 1
	m.place = "ON SELECTION POPUP ALL"
CASE Objtype = 2 AND Objcode <> 1
	m.place = "ON SELECTION POPUP "+LOWER(ALLTRIM(Name))
CASE Objtype = 3 AND Levelname = "_MSYSMENU"
	m.place = "ON SELECTION PAD "
CASE Objtype = 3 AND Levelname <> "_MSYSMENU"
	m.place = "ON SELECTION BAR "+ALLTRIM(Itemnum)+;
		+" OF POPUP "+LOWER(ALLTRIM(Levelname))
OTHERWISE
	m.place = ""
ENDCASE
\
\*       <<m.g_corn1>><<REPLICATE(m.g_horiz,57)>><<m.g_corn2>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> <<UPPER(m.procname)>>  <<m.place>>
\\<<REPLICATE(" ",44-LEN(m.place))>><<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> Procedure Origin:
\\<<REPLICATE(" ",39)>><<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_verti>> From Menu:
\\  <<ALLTRIM(strippath(m.g_outfile))>>
\\,            Record:  <<STR(RECNO(),3)>>
\\<<REPLICATE(" ",22-LEN(ALLTRIM(strippath(m.g_outfile))+STR(RECNO(),3))))>>
\\<<m.g_verti>>
\*       <<m.g_verti>> Called By:  <<m.place>>
\\<<REPLICATE(" ",44-LEN(m.place))>><<m.g_verti>>
IF NOT EMPTY(Prompt)
	m.prompt = removemeta()
	\*       <<m.g_verti>> Prompt:     <<ALLTRIM(m.prompt)>>
	\\<<REPLICATE(" ",44-LEN(ALLTRIM(m.prompt)))>><<m.g_verti>>
ENDIF
\*       <<m.g_verti>> Snippet:
\\    <<ALLTRIM(STR(m.g_snippcnt,2))>>
\\<<REPLICATE(" ",44-LEN(ALLTRIM(STR(m.g_snippcnt,2))))>><<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_corn3>><<REPLICATE(m.g_horiz,57)>><<m.g_corn4>>
\*

*
* REMOVEMETA - Remove meta characters for documentation.
*
*!*********************************************************************
*!
*!      Procedure: REMOVEMETA
*!
*!      Called by: GENFUNCHEADER  (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION removemeta
PRIVATE m.prompt, m.hotkey
m.prompt = Prompt
m.hotkey = AT("\<",m.prompt)

IF m.hotkey <> 0
	m.prompt = STUFF(m.prompt,m.hotkey,2,"")
ENDIF

m.disabl = AT("\",m.prompt)
IF m.disabl <> 0
	m.prompt = STUFF(m.prompt,m.disabl,1,"")
ENDIF
RETURN m.prompt

*
* COMMENTBLOCK - Generate a comment block.
*
*!*********************************************************************
*!
*!      Procedure: COMMENTBLOCK
*!
*!      Called by: DEFINEMENU     (procedure in GENMENU.PRG)
*!               : GENSETUPCLEANUP(procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE commentblock
PARAMETER m.snippet
\
\*       <<m.g_corn1>><<REPLICATE(m.g_horiz,57)>><<m.g_corn2>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
DO CASE
CASE m.snippet == "setup"
	\*       <<m.g_verti>>
	\\ <<PADC(" Setup Code",56," ")>>
CASE m.snippet == "cleanup"
	\*       <<m.g_verti>>
	\\ <<PADC(" Cleanup Code & Procedures",56," ")>>
CASE m.snippet == "init"
	\*       <<m.g_verti>>
	\\ <<PADC(" Initializing Code",56," ")>>
CASE m.snippet == "menu"
	\*       <<m.g_verti>>
	\\ <<PADC(" Menu Definition",56," ")>>
ENDCASE
\\<<m.g_verti>>
\*       <<m.g_verti>><<REPLICATE(" ",57)>><<m.g_verti>>
\*       <<m.g_corn3>><<REPLICATE(m.g_horiz,57)>><<m.g_corn4>>
\*
\

** formfeed 
**
** Supporting routines
**

*
* ONSELECTION - Generate ON SELECTION... statements for menu items.
*
* Description:
* For pads and bars which have no submenu associated with them but
* instead have a non-empty Command field in the database, issue
* the ON SELECTION <command> statements.  If a snippet is associated
* with a pad then issue a call statement to the generated procedure
* containing the snippet.  Generated snippet procedure will be
* appended to the end of the output file.
*
*!*********************************************************************
*!
*!      Procedure: ONSELECTION
*!
*!      Called by: DEFONPAD       (procedure in GENMENU.PRG)
*!               : DEFONBAR       (procedure in GENMENU.PRG)
*!
*!          Calls: GENSNIPPNAME   (procedure in GENMENU.PRG)
*!               : STRIPEXT       (procedure in GENMENU.PRG)
*!               : BASENAME       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE onselection
PARAMETER m.which, m.name, m.ofname, m.commd
PRIVATE m.trimname, m.basename
IF EMPTY(Procedure) AND EMPTY(Command)
	RETURN
ENDIF
DO CASE
CASE m.which == "pad"
	\ON SELECTION PAD <<m.name>>
CASE m.which == "BAR"
	\ON SELECTION <<m.which+" "+m.name>>
ENDCASE
\\ OF <<m.ofname>>
IF Objcode = M.G_PROC
	DO gensnippname
	m.trimname = SYS(2014,m.g_outfile,m.g_homedir)
	m.trimname = stripext(m.trimname)
	m.basename = basename(m.trimname)
	\\ ;
	\	DO <<g_snippets[g_nsnippets,1]>> ;
	\	IN LOCFILE("<<m.trimname>>"
	\\ ,"MPX;MPR|FXP;PRG"
	\\ ,"Where is <<m.basename>>?")
ELSE
	m.commd = Command
	\\ <<m.commd>>
ENDIF

*
* GENSNIPPNAME - Generate a unique name for snippet procedure.
*
* Description:
* Provide a unique name for a snippet of code associated with the
* generated menu.  Save this name in an array g_snippets.
*
*!*********************************************************************
*!
*!      Procedure: GENSNIPPNAME
*!
*!      Called by: ONSELECTION    (procedure in GENMENU.PRG)
*!               : GENPROCCALL    (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE gensnippname
g_nsnippets = g_nsnippets + 1
g_snippets[g_nsnippets,1] = LOWER(SYS(2015))
g_snippets[g_nsnippets,2] = RECNO()

IF MOD(g_nsnippets,25) = 0
	DIMENSION g_snippets [g_nsnippets+25,2]
ENDIF

*
* GENPROCCALL - Generate a call statement to snippet procedure.
*
* Description:
* Generate a call to the snippet procedure in the menu definition
* code.
*
*!*********************************************************************
*!
*!      Procedure: GENPROCCALL
*!
*!      Called by: GLOBALDEFAULTS (procedure in GENMENU.PRG)
*!
*!          Calls: SINGLELINE     (procedure in GENMENU.PRG)
*!               : GENSNIPPNAME   (procedure in GENMENU.PRG)
*!               : STRIPEXT       (procedure in GENMENU.PRG)
*!               : BASENAME       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE genproccall
PRIVATE m.trimname, m.basename, m.proc
IF singleline()
	m.proc = Procedure
	\\ <<MLINE(m.proc,1)>>
ELSE
	DO gensnippname
	m.trimname = SYS(2014,m.g_outfile,m.g_homedir)
	m.trimname = stripext(m.trimname)
	m.basename = basename(m.trimname)
	\\ ;
	\	DO <<g_snippets[m.g_nsnippets,1]>> ;
	\	IN LOCFILE("<<m.trimname>>"
	\\ ,"MPX;MPR|FXP;PRG"
	\\ ,"Where is <<m.basename>>?")
ENDIF

*
* SINGLELINE - Determine if Memo contains only one line.
*
* Description:
* This procedure is used to decide if an ON SELECTION... statement
* and a snippet procedure will be needed (i.e., if more than one
* line of snippet code then its a snippet, otherwise its a command)
*
*!*********************************************************************
*!
*!      Procedure: SINGLELINE
*!
*!      Called by: GENPROCCALL    (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION singleline
PRIVATE m.size, m.i
m.size = MEMLINES(Procedure)
IF m.size = 1
	RETURN .T.
ENDIF
m.i = m.size
DO WHILE m.i > 1
	m.line = MLINE(Procedure, m.i)
	IF NOT EMPTY(m.line)
		RETURN .F.
	ENDIF
	m.i = m.i - 1
ENDDO

*
* GENPROCEDURES - Generate procedure/snippet code.
*
* Description:
* Generate 'PROCEDURE procedurename' statement and its body.
*
*!*********************************************************************
*!
*!      Procedure: GENPROCEDURES
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: GENFUNCHEADER  (procedure in GENMENU.PRG)
*!               : WRITECODE      (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE genprocedures
PRIVATE m.i
FOR m.i = 1 TO m.g_nsnippets
	GOTO RECORD (g_snippets[m.i,2])
	DO genfuncheader WITH g_snippets[m.i,1]
	\PROCEDURE <<g_snippets[m.i,1]>>
	DO writecode WITH Procedure
	\
ENDFOR

*
* WRITECODE - Write contents of a memo to a low level file.
*
* Description:
* Receive a memo field as a parameter and write its contents out
* to the currently opened low level file whose handle is stored
* in the system memory variable _TEXT.  Contents of the system
* memory variable _pretext will affect the positioning of the
* generated text.
*
*!*********************************************************************
*!
*!      Procedure: WRITECODE
*!
*!      Called by: GENPROCEDURES  (procedure in GENMENU.PRG)
*!               : GENSETUPCLEANUP(procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE writecode
PARAMETER m.memo
PRIVATE m.lines, m.i
m.lines = MEMLINES(m.memo)
_MLINE = 0
FOR m.i = 1 TO m.lines
	\<<MLINE(m.memo, 1, _MLINE)>>
ENDFOR

*
* GENSETUPCLEANUP - Generate setup/cleanup code.
*
*!*********************************************************************
*!
*!      Procedure: GENSETUPCLEANUP
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!          Calls: COMMENTBLOCK   (procedure in GENMENU.PRG)
*!               : WRITECODE      (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE gensetupcleanup
PARAMETER m.choice
LOCATE FOR Objtype = M.G_MENU
DO CASE
CASE m.choice == "setup"
	IF EMPTY(Setup)
		RETURN
	ENDIF
	DO commentblock WITH m.choice
	DO writecode WITH Setup
CASE m.choice == "cleanup"
	IF EMPTY(Cleanup)
		RETURN
	ENDIF
	DO commentblock WITH m.choice
	DO writecode WITH Cleanup
ENDCASE

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
*!      Called by: VALIDPARAMS()  (function  in GENMENU.PRG)
*!               : OPENDB         (procedure in GENMENU.PRG)
*!               : ONSELECTION    (procedure in GENMENU.PRG)
*!               : GENPROCCALL    (procedure in GENMENU.PRG)
*!               : BASENAME       (procedure in GENMENU.PRG)
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
*!      Called by: OPENDB         (procedure in GENMENU.PRG)
*!               : BASENAME       (procedure in GENMENU.PRG)
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
* BASENAME - returns strippath(stripext(filespec))
*
*!*********************************************************************
*!
*!      Procedure: BASENAME
*!
*!      Called by: VALIDPARAMS()  (function  in GENMENU.PRG)
*!               : ONSELECTION    (procedure in GENMENU.PRG)
*!               : GENPROCCALL    (procedure in GENMENU.PRG)
*!
*!          Calls: STRIPPATH      (procedure in GENMENU.PRG)
*!               : STRIPEXT       (procedure in GENMENU.PRG)
*!
*!*********************************************************************
FUNCTION basename
PARAMETER m.filespec
RETURN strippath(stripext(m.filespec))

** formfeed 
**
** Code Associated with the Thermometer
**

*
* ACTTHERM(<text>) - Activate thermometer.
*
* Description:
* Activates thermometer.  Update the thermometer with UPDTHERM().
* Thermometer window is named "thermometer."  Be sure to RELEASE
* this window when done with thermometer.  Creates the global
* m.g_thermwidth.
*
*!*********************************************************************
*!
*!      Procedure: ACTTHERM
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE acttherm
PARAMETER m.text
PRIVATE m.therm_x1, m.therm_y1, m.therm_x2, m.therm_y2
m.therm_x1	= INT((SROW()-6)/2)
m.therm_y1	= INT((SCOL()-57)/2)
m.therm_x2 	= m.therm_x1 + 6
m.therm_y2 	= m.therm_y1 + 57

DEFINE WINDOW thermometer;
	FROM m.therm_x1, m.therm_y1 TO m.therm_x2, m.therm_y2;
	FLOAT DOUBLE COLOR SCHEME 5

ACTIVATE WINDOW thermometer
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
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!               : DEFINEMENU     (procedure in GENMENU.PRG)
*!               : DEFMENUPADS    (procedure in GENMENU.PRG)
*!               : DEFONPAD       (procedure in GENMENU.PRG)
*!               : DEFINEPOPUPS   (procedure in GENMENU.PRG)
*!               : DEFBARS        (procedure in GENMENU.PRG)
*!               : DEFONBAR       (procedure in GENMENU.PRG)
*!               : GLOBALDEFAULTS (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE updtherm
PARAMETER m.percent
PRIVATE m.nblocks, m.percent
ACTIVATE WINDOW thermometer
m.nblocks = (m.percent/100) * (m.g_thermwidth-4)
@ 3,3 SAY REPLICATE("Û",m.nblocks)

*
* DEACTTHERMO - Deactivate and Release thermometer window.
*
*!*********************************************************************
*!
*!      Procedure: DEACTTHERMO
*!
*!      Called by: BUILD          (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE deactthermo
RELEASE WINDOW thermometer

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
*!      Called by: GENMENU.PRG                   
*!               : VALIDPARAMS()  (function  in GENMENU.PRG)
*!               : REFRESHPREFS   (procedure in GENMENU.PRG)
*!               : BUILDDISABLE   (procedure in GENMENU.PRG)
*!               : OPENDB         (procedure in GENMENU.PRG)
*!               : OPENFILE       (procedure in GENMENU.PRG)
*!
*!          Calls: CLEANUP        (procedure in GENMENU.PRG)
*!               : ERRLOG         (procedure in GENMENU.PRG)
*!               : ERRSHOW        (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE errorhandler
PARAMETERS m.messg, m.lineno, m.code
IF ERROR() = 22
	ON ERROR
	DO cleanup
	CANCEL
ENDIF

DO CASE
CASE m.code == "Minor"
	DO errlog WITH m.messg, m.lineno
	m.g_status = 1
CASE m.code == "Serious"
	DO errlog  WITH m.messg, m.lineno
	DO errshow WITH m.messg, m.lineno
	m.g_error = .T.
	m.g_status = 2
	ON ERROR
CASE m.code == "Fatal"
	IF NOT m.g_nohandle
		DO errlog  WITH m.messg, m.lineno
	ENDIF
	DO errshow WITH m.messg, m.lineno
	IF WEXIST("Thermomete") AND WVISIBLE("Thermomete")
		RELEASE WINDOW Thermometer
	ENDIF
	ON ERROR
	DO cleanup
	IF talkstate = "ON"
		SET TALK ON
	ENDIF
	IF m.comp = "ON"
		SET COMPATIBLE ON
	ENDIF
	IF trbetween = "ON"
		SET TRBET ON
	ELSE
		SET TRBET OFF
	ENDIF
	CANCEL
ENDCASE

*
* ESCHANDLER - Escape handler.
*
*!*********************************************************************
*!
*!      Procedure: ESCHANDLER
*!
*!      Called by: GENMENU.PRG                   
*!
*!          Calls: BUILDDISABLE   (procedure in GENMENU.PRG)
*!               : CLEANUP        (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE eschandler
ON ERROR
WAIT WINDOW "Generation process stopped." NOWAIT
DO builddisable
IF m.g_status > 0
	ERASE (m.g_outfile)
ENDIF
IF WEXIST("Thermomete") AND WVISIBLE("Thermomete")
	RELEASE WINDOW Thermometer
ENDIF
DO cleanup
CANCEL

*
* ERRLOG - Insert error message into the error log.
*
*!*********************************************************************
*!
*!      Procedure: ERRLOG
*!
*!      Called by: ERRORHANDLER   (procedure in GENMENU.PRG)
*!
*!          Calls: OPENERRFILE    (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE errlog
PARAMETER m.messg, m.lineno
PRIVATE m.savehandle
m.savehandle = _TEXT
DO openerrfile
SET CONSOLE OFF

\\GENERATOR: <<ALLTRIM(m.messg)>>
IF NOT EMPTY(m.lineno)
	\\ LINE NUMBER: <<m.lineno>>
ENDIF
\
= FCLOSE(_TEXT)
_TEXT = m.savehandle

*
* ERRSHOW - Display error message in the alert box.
*
*!*********************************************************************
*!
*!      Procedure: ERRSHOW
*!
*!      Called by: ERRORHANDLER   (procedure in GENMENU.PRG)
*!               : OPENERRFILE    (procedure in GENMENU.PRG)
*!
*!*********************************************************************
PROCEDURE errshow
PARAMETER m.messg, m.lineno
PRIVATE fromrow, fromcol, torow, tocol
fromrow = INT((SROW()-6)/2)
fromcol = INT((SCOL()-50)/2)
torow   = fromrow + 6
tocol   = fromcol + 50

DEFINE WINDOW alert;
	FROM fromrow, fromcol TO torow, tocol;
	FLOAT NOGROW NOCLOSE NOZOOM	SHADOW DOUBLE;
	COLOR SCHEME 7

ACTIVATE WINDOW alert

@ 0,0 CLEAR
@ 1,0 SAY PADC(ALLTRIM(m.messg), WCOLS())
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
*!      Called by: ERRLOG         (procedure in GENMENU.PRG)
*!
*!          Calls: ERRSHOW        (procedure in GENMENU.PRG)
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

*: EOF: GENMENU.PRG
