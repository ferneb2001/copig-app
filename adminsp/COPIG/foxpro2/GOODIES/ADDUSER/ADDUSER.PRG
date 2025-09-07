*********************************************************************
* ADDUSER - This program should be run for each work station that   *
* is attached to your FoxPro multi-user system.  It enables each    *
* individual work station to be optimally configured for providing  *
* the best performance.                                             *
*********************************************************************

* Do setup and initialization

ON ERROR DO abort
CREATE VIEW adduser
DO cleanup
PUBLIC keyword[8], loc[6], locopts, bootdisk, savedir, cr, maxpath
PUBLIC defdir, extended, memcheck, memval, ems64, memopts, savopt
PUBLIC savescheme
DO setup

* Here's the interactive part

success = .F.
IF proceed()
	IF config()
		FOR option = 1 TO locopts
			loc[option] = ALLTRIM(loc[option])
		ENDFOR
		IF INLIST(bootdisk, 'A', 'B')
			DO floppy
		ENDIF
		IF autoexec()
			IF config_fp()
				DO resource
				success = .T.
			ENDIF
		ENDIF
		DO final WITH success
	ENDIF
ENDIF

* Now clean up and restore the environment

RELEASE MODULE isdiskin

ON ERROR
SET COLOR OF SCHEME 1 TO &savescheme
DO cleanup
SET VIEW TO adduser
IF SET("TALK") = "ON"
	SET TALK OFF
	DELETE FILE adduser.vue
	SET TALK ON
ELSE
	DELETE FILE adduser.vue
ENDIF
RETURN

*************************************************************
* SETUP - Initialize CONFIG.FP parameters and other globals *
*************************************************************
PROCEDURE setup

* Setup the environment *

SET TALK OFF
SET ESCAPE OFF
SET MESSAGE TO 24 CENTER
SET STATUS OFF
SET SYSMENU OFF
SET DECIMALS TO 0

* Close any open windows *

DO WHILE .T.
	wname = WONTOP()
	IF LEN(wname) = 0
		EXIT
	ENDIF
	RELEASE WINDOW &wname
ENDDO

* Fiddle with the color scheme

STORE SCHEME(1) TO myscheme, savescheme
spos = AT("/", myscheme) + 1
invis = SUBSTR(myscheme, spos, AT(",", myscheme) - spos)
invis = invis + "/" + invis 

spos = AT(",", myscheme, 4) + 1
len = AT(",", myscheme, 5) - spos
myscheme = STUFF(myscheme, spos, len, SCHEME(1,4))

spos = AT(",", myscheme, 8) + 1
len = AT(",", myscheme, 9) - spos
myscheme = STUFF(myscheme, spos, len, SCHEME(1,1))

spos = AT(",", myscheme, 9) + 1
len = AT(",", myscheme, 10) - spos
myscheme = STUFF(myscheme, spos, len, invis)

SET COLOR OF SCHEME 1 TO &myscheme
CLEAR

* Bring in the floppy disk checking utility

LOAD isdiskin
   
* Initialize globals 

extended = "(X)" $ VERSION()
locopts = IIF(extended, 5, 6)
memopts = IIF(extended, 1, 2)

keyword[1] 			= ""
keyword[2] 			= "RESOURCE"
keyword[3] 			= "OVERLAY"
keyword[locopts-2] 	= "EDITWORK"
keyword[locopts-1] 	= "SORTWORK"
keyword[locopts] 	= "PROGWORK"
IF extended
	keyword[locopts+1]	= "DOSMEM"
ELSE
	keyword[locopts+1]	= "EMS"
	keyword[locopts+2]	= "EMS64"
ENDIF	

bootdisk = UPPER(LEFT(GETENV('comspec'), 1))
savedir = SYS(5)+SYS(2003)
cr = CHR(13)+CHR(10)+CHR(13)+CHR(10)
maxpath = 130
savopt = -1
defdir = GETENV("FOXPROCFG")
IF LEN(defdir) <> 0
	defdir = FULLPATH(defdir)
	spos = RAT('\', defdir)
	defdir = PADR(LEFT(defdir, spos), maxpath)
ELSE	
	IF NOT INLIST(bootdisk, 'A', 'B')

	* Use current working directory of boot disk as default location *

		SET DEFAULT TO (bootdisk)			
		STORE PADR(bootdisk+ ":" + SYS(2003), maxpath) TO defdir
		SET DEFAULT TO (savedir)
	ELSE
		defdir = SPACE(maxpath)
	ENDIF
ENDIF

RETURN

**************************************************************************
* GETDEFAULTS - Initialize directories and pathnames with default values *
**************************************************************************
PROCEDURE getdefaults

* Initialize file location parameter values

IF RIGHT(defdir, 1) <> '\'
	defdir = defdir + '\'
ENDIF
loc[1] = GETENV("FOXPROCFG")
IF LEN(loc[1]) = 0
	loc[1] = defdir + "CONFIG.FP"
ENDIF
FOR option = 2 TO locopts
	loc[option] = defdir
ENDFOR
loc[2] = loc[2] + "FOXUSER.DBF"

* See if there is a default config file

cfgdef = FOPEN(SYS(2004)+"CONFIG.DEF", 0)	&& Try opening default config
IF cfgdef <> -1								&& Does it exist?
	filesize = FSEEK(cfgdef, 0, 2)
	= FSEEK(cfgdef, 0, 0)
	contents = FREAD(cfgdef, filesize)		&& Read its contents
	= FCLOSE(cfgdef)
	FOR option = 2 TO locopts				&& Look for overriding parameters
		spos = ATC(keyword[option], contents)
		IF spos <> 0						&& Found parameter, extract it
			spos = spos + AT("=", SUBSTR(contents, spos))
			len = AT(CHR(13)+CHR(10), SUBSTR(contents, spos)) - 1
			loc[option] = ALLTRIM(SUBSTR(contents, spos, IIF(len <> 0, len, filesize)))
			IF NOT extended AND option = 3
				spos = ATC(" OVERWRITE", loc[3])
				IF spos <> 0
					loc[3] = LEFT(loc[3], spos)
				ENDIF
			ENDIF
		ENDIF
	ENDFOR
ENDIF

FOR option = 1 TO locopts
	IF LEN(loc[option]) < maxpath
		loc[option] = PADR(loc[option], maxpath)
	ENDIF
ENDFOR

RETURN

************************************
* CONFIG - Do the interactive part *
************************************
FUNCTION config
DIMENSION say[6]
say[1] 			= "CONFIG.FP pathname         "
say[2] 			= "FOXUSER pathname           "
say[3] 			= "Overlay files directory    "
say[locopts-2] 	= "Editor work files directory"
say[locopts-1] 	= "Sort work files directory  "
say[locopts] 	= "Program work file directory"

DEFINE WINDOW explain FROM 11,4 TO 22,75 DOUBLE ;
		TITLE ' Description of Configuration Option '

ok = .F.
@ 1,0 TO 24,79 CLEAR
@ 1, 62 SAY "Free Disk Space"
memval = IIF(extended, MEMORY(), VAL(SYS(23)))
ems64 = .F.
      
FOR option = 1 TO locopts
	row = option + IIF(option < 3, 1, 2)
	@ row,3 SAY say[option] GET loc[option] FUNCTION "S30" ;
		WHEN whenloc() VALID validloc() ;
   		ERROR "Invalid directory or pathname"
ENDFOR
IF extended
	@ 9, 3 GET memcheck FUNCTION '*C Limit the memory reserved for Non-FoxPro functions ';
		WHEN whenmem() VALID validmem() DEFAULT .F.
	@ 9, 59 GET memval PICTURE "999,999 KB";
		RANGE 0, MEMORY() DISABLE
ELSE
	@ 9, 3 GET memcheck FUNCTION '*C Limit EMS Available to FoxPro ';
		WHEN whenmem() VALID validmem() DEFAULT .F.
	@ 9, 38 GET memval PICTURE "999,999 KB" RANGE 0, VAL(SYS(23)) DISABLE
	@ 9, 50 GET ems64 FUNCTION "*C Avoid first 64K of EMS" DISABLE
ENDIF
@ 23, 18 GET procbut  FUNCTION "*T \!OK"  SIZE 1,10;
	DEFAULT 0;
	MESSAGE "Your AUTOEXEC.BAT will be modified and a CONFIG.FP created."
@ 23, 36 GET filerbut FUNCTION "*N Filer" SIZE 1,10;
	VALID validfiler() DEFAULT 0;
    MESSAGE "Browse the directories on your disk ... Press ESCAPE to continue."
@ 23, 54 GET abortbut FUNCTION "*T \?Cancel" SIZE 1,10;
	DEFAULT 0;
    MESSAGE "Cancel the configuration procedure without making any changes."
   	
READ CYCLE
   	
@ 23, 0
RELEASE WINDOW explain
RETURN IIF(procbut = 1, .T., .F.)

******************************************
* WHENLOC - This is the WHEN clause UDF *
******************************************
FUNCTION whenloc
error = .F.

* Clear old stats *

IF BETWEEN(option, 1, locopts)
	@ option + IIF(option < 3, 1, 2), 64 SAY SPACE(11)
ENDIF

getvar = VARREAD()
option = VAL(SUBSTR(getvar, 5))
pathname = loc[option]

* Show available disk space * 

IF LEN(ALLTRIM(&getvar)) <> 0
	ON ERROR error = .T.
	SET DEFAULT TO LEFT(pathname, 1)
	ON ERROR DO abort
	IF NOT error AND NOT INLIST(SYS(5), "A:", "B:")
		@ option + IIF(option < 3, 1, 2), 64 SAY TRANSFORM(DISKSPACE(),"999,999,999")
	ENDIF
	SET DEFAULT TO (savedir)
	IF error
		DO abort
	ENDIF
ENDIF

* Display explanation of configuration option *

DO explanation
RETURN .T.

********************************************
* VALIDLOC - This is the VALID clause UDF *
********************************************
FUNCTION validloc
ok = .T.
getvar = VARREAD()
option = VAL(SUBSTR(getvar, 5))
pathname = UPPER(ALLTRIM(loc[option]))

* Validate the parameter *

DO CASE option
CASE option = 1
	basename = "CONFIG.FP"
CASE option = 2
	basename = "FOXUSER.DBF"
OTHERWISE
	basename = ""
ENDCASE
ok = validparm()

* Save validated directory or pathname *

IF ok
	loc[option] = IIF(LEN(pathname) > maxpath, pathname, PADR(pathname, maxpath))
ENDIF
RETURN ok

******************************************************************
* WHENMEM - This is the WHEN clause UDF for memory configuration *
******************************************************************
FUNCTION whenmem

* Clear old stats *

IF BETWEEN(option, 1, locopts)
	@ option + IIF(option < 3, 1, 2), 64 SAY SPACE(11)
ENDIF

* Display explanation of configuration option *

option = 7
DO explanation

RETURN .T.

********************************************************************
* VALIDMEM - This is the VALID clause UDF for memory configuration *
********************************************************************
FUNCTION validmem

FOR i = 1 TO memopts
	IF memcheck
		SHOW OBJECT _curobj + i ENABLE
	ELSE
		SHOW OBJECT _curobj + i DISABLE		
	ENDIF
ENDFOR		

RETURN .T.

*****************************
* VALIDFILER - Filer chosen *
*****************************
FUNCTION validfiler
FILER
IF WEXIST("Filer")
	DEACTIVATE WINDOW FILER
ENDIF
DO WHILE .T.		&& Close any editor windows opened from filer
	wname = WONTOP()
	IF UPPER(wname) <> "EXPLAIN"
		RELEASE WINDOW &wname
	ELSE
		EXIT
	ENDIF
ENDDO
RETURN 0

******************************************
* ABORT - Error occurred: Just shut down *
******************************************
PROCEDURE abort
ON ERROR
CLEAR TYPEAHEAD
WAIT MESSAGE() WINDOW TIMEOUT 20
IF ERROR() = 1001
	ON ERROR DO abort
	RETURN
ENDIF
DO cleanup
QUIT

*************************************************
* CLEANUP - Close everything down				*
*************************************************
PROCEDURE cleanup
CLEAR ALL
CLEAR
ON KEY
RETURN

************************************************
* CHECKDISK - Make sure boot disk is available *
************************************************
FUNCTION checkdisk
PARAMETER drive, disktype

diskin = .F.
checking = .T.
dletter = UPPER(drive)
DO WHILE NOT diskin AND checking
	CALL isdiskin WITH dletter
	IF dletter = '0'
		dletter = UPPER(drive)
		WAIT "Insert your " + IIF(LEN(disktype) = 0, "work files", disktype) ;
		+ " disk in Drive " + dletter + ".  Press any key to continue." WINDOW
		IF LASTKEY() = 27
			checking = .F.
		ENDIF
	ELSE
		diskin = .T.
	ENDIF
ENDDO
RETURN diskin

*************************************************************
* AUTOEXEC - Create or modify the workstation autoexec file *
*************************************************************
FUNCTION autoexec
IF !checkdisk(bootdisk, "boot")
	RETURN .F.
ENDIF
filename = bootdisk + ":\AUTOEXEC.BAT"

IF !confirm(filename)
   RETURN .F.
ENDIF   

setcmd = "SET FOXPROCFG="+loc[1]+CHR(13)+CHR(10)
autoexec = FOPEN(filename, 2)
IF autoexec == -1						&& Can't find autoexec.bat
	autoexec = FCREATE(filename, 0)		&& Create an autoexec.bat
	IF autoexec == -1
		RETURN .F.
	ELSE
		= FWRITE(autoexec, setcmd)
		= FCLOSE(autoexec)
		RETURN .T.
	ENDIF
ELSE								&& Found one so modify it
	filesize = FSEEK(autoexec, 0, 2)
	= FSEEK(autoexec, 0, 0)
	contents = FREAD(autoexec, filesize)

	IF RIGHT(contents, 2) <> CHR(13)+CHR(10)
	   contents = contents + CHR(13) + CHR(10)
	   filesize = filesize + 2
	ENDIF
	
	spos = ATC("SET FOXPROCFG", contents)
	IF spos <> 0					&& Already there, just modify
		len = AT(CHR(13)+CHR(10), SUBSTR(contents, spos)) + 1
		IF len = 0
			len = LEN(SUBSTR(contents, spos))
		ENDIF
	ELSE							&& Not there, append
		len = AT(CHR(26), contents)
		IF len <> 0
			contents = LEFT(contents, len - 1)
			len = 0
		ENDIF
		spos = RAT(CHR(13)+CHR(10), contents, ;
					IIF(RIGHT(contents, 2) <> CHR(13)+CHR(10), 1, 2))
		spos = spos + IIF(spos = 0, 1, 2)
	ENDIF
	contents = STUFF(contents, spos, len, setcmd)
 	= FSEEK(autoexec, 0, 0)
	= FWRITE(autoexec, contents)
	= FCHSIZE(autoexec, LEN(contents))
	= FCLOSE(autoexec)
ENDIF
RETURN .T.

********************************************************
* CONFIG_FP - Create or modify workstation CONFIG file *
********************************************************
FUNCTION config_fp
IF NOT checkdisk(LEFT(loc[1], 1), loc[1])
	RETURN .F.
ENDIF

IF NOT confirm(loc[1])
   RETURN .F.
ENDIF   

config = FOPEN(loc[1], 2)			&& Open the config file
IF config == -1						&& Can't find it?
	config = FCREATE(loc[1], 0)		&& Create a config file
	IF config == -1
		RETURN .F.
	ELSE							&& Use default config file as basis
		cfgdef = FOPEN(SYS(2004)+"CONFIG.DEF", 0)	&& Open default config
		IF cfgdef <> -1								&& Does it exist?
			filesize = FSEEK(cfgdef, 0, 2)
			= FSEEK(cfgdef, 0, 0)
			contents = FREAD(cfgdef, filesize)		&& Read its contents
			= FCLOSE(cfgdef)
			IF RIGHT(contents, 2) <> CHR(13)+CHR(10)
				contents = contents + CHR(13)+CHR(10)
			ENDIF
			FOR option = 2 TO locopts + memopts	&& Remove default config options
				spos = ATC(keyword[option], contents)
				IF spos <> 0		&& Found it
					len = AT(CHR(13)+CHR(10), SUBSTR(contents, spos)) + 1
					contents = STUFF(contents, spos, len, "")
				ENDIF
			ENDFOR
		ELSE
			contents = ""
		ENDIF
		FOR option = 2 TO locopts + memopts	&& Now append directory options
			contents = contents + makeoption(option)
		ENDFOR
		= FWRITE(config, contents)
		= FCLOSE(config)
		RETURN .T.
	ENDIF
ELSE								&& Found one so modify it
	filesize = FSEEK(config, 0, 2)
	= FSEEK(config, 0, 0)
	contents = FREAD(config, filesize)

	IF RIGHT(contents, 2) <> CHR(13)+CHR(10)
	   contents = contents + CHR(13) + CHR(10)
	   filesize = filesize + 2
	ENDIF
	
	FOR option = 2 TO locopts + memopts
		spos = ATC(keyword[option], contents)
		IF spos <> 0					&& Already there, just modify
			len = AT(CHR(13)+CHR(10), SUBSTR(contents, spos)) + 1
			IF len = 0
				len = LEN(SUBSTR(contents, spos))
			ENDIF
		ELSE							&& Not there, append
			spos = filesize + 1
			len = 0
		ENDIF
		contents = STUFF(contents, spos, len, makeoption(option))
	ENDFOR
		
	= FSEEK(config, 0, 0)
	= FWRITE(config, contents)
	= FCHSIZE(config, LEN(contents))
	= FCLOSE(config)
ENDIF
RETURN .T.

******************************************
* MAKEOPTION - Construct a config option *
******************************************
FUNCTION makeoption
PARAMETER option
configcmd = ""
	
IF option <= locopts
	configcmd = keyword[option] + "=" + loc[option] + ;
				IIF(option=3 AND NOT extended," OVERWRITE","")
ELSE
	IF memcheck AND memval = IIF(extended, MEMORY(), VAL(SYS(23)))
		memcheck = .F.
	ENDIF
	IF memcheck
		IF option = locopts + 1
			chkval = IIF(extended, "ON", "OFF")
			configcmd = keyword[option] + "=" + ;
						IIF(memval = 0, chkval, ALLTRIM(STR(memval)))
		ELSE 
			IF ems64
				configcmd = keyword[option] + "=OFF"
			ENDIF
		ENDIF
	ENDIF
ENDIF
		
RETURN configcmd + IIF (LEN(configcmd) <> 0, CHR(13) + CHR(10), "")

************************************************************************
* RESOURCE - If FOXUSER file doesn't exist for this work station, copy *
*            DEFUSER file as FOXUSER for this work station.			     *
************************************************************************
PROCEDURE resource
deffile = SYS(2004)+"DEFUSER.DBF"
IF NOT FILE(deffile)		
	RETURN		&& Don't bother if default resource doesn't exist
ENDIF

IF NOT UPPER(RIGHT(loc[2], 4)) = '.DBF'
	loc[2] = loc[2] + '.DBF'
ENDIF
IF FILE(loc[2])		&& Resource file for work station already exists
	RETURN
ENDIF
		
USE (deffile)
COPY TO (loc[2])
USE
RETURN

*****************************************************************
* VALIDPARM - Make sure you have a valid pathname or directory 	*
*****************************************************************
PROCEDURE validparm
IF NOT checkdisk(LEFT(pathname, 1), basename)
	RETURN .F.
ENDIF

needdir = IIF(LEN(basename) = 0, .T., .F.)
IF NOT needdir
	extension = SUBSTR(basename, AT(".", basename))
ENDIF
STORE .T. TO ok

* See if we have an existing directory *

isdir = isdir(pathname)
IF NOT isdir							&& It was not a valid directory
	IF needdir
		ok = mkdir(pathname)
	ELSE								&& It's supposed to be a pathname
		lastpos = RAT('\', pathname)
		IF lastpos > 3					&& Make sure the dir. exists
			IF lastpos <> LEN(pathname)	&& Remove any filename part
				isdir = isdir(LEFT(pathname, lastpos))
			ENDIF
			IF NOT isdir
				ok = mkdir(LEFT(pathname, lastpos-1))
			ENDIF
		ENDIF
		IF ok AND lastpos <> LEN(pathname)	&& Must be a filename
			isdir = .F.
			IF AT('.', pathname) = 0
				pathname = pathname + extension
			ENDIF
		ENDIF
	ENDIF
ENDIF
IF isdir								&& Must have been a valid directory
	IF RIGHT(pathname,1) <> "\"
		pathname = pathname + "\"
	ENDIF
	IF NOT needdir						&& Must need a filename
		pathname = pathname + basename
	ENDIF
ENDIF
RETURN ok

********************************************************
* MKDIR - Find out if user wants to create a directory *
********************************************************
FUNCTION mkdir
PARAMETER directory
ans = 2
DEFINE WINDOW alert FROM 13, 14 to 18, 66 COLOR SCHEME 7 DOUBLE
ACTIVATE WINDOW alert
?? CHR(7)
?? directory + " does not exist.  Do you want to create it?" ;
   	AT 2 FUNCTION "v47"
@ 3, 10 GET ans FUNCTION "*H \!\<Yes;\?\<No" SIZE 1, 12, 8
READ CYCLE OBJECT 2
RELEASE WINDOW alert
IF ans <> 1
	ok = .F.
ELSE
	next = 2						&& Start looking after the root
	ok = checkdisk(LEFT(directory,1), basename)
	DO WHILE ok
		pos = AT('\', directory, next)
		work = IIF(pos <> 0, LEFT(directory, pos-1), directory)
		isdir = FILE(work + "\NUL")		&& See if it is a directory
		IF NOT isdir					&& If not, try to create it
			command = "RUN mkdir " + work
			&command
			ok = FILE(work + "\NUL")	&& Check if successful
		ENDIF
		IF pos = LEN(directory)			&& We've finished checking
			pos = 0
		ENDIF
		IF pos = 0 OR NOT ok
			EXIT
		ELSE
			next = next + 1
		ENDIF
	ENDDO
ENDIF
RETURN ok

********************************************************
* CONFIRM - Prompt for confirmation to update file     *
********************************************************
FUNCTION confirm
PARAMETER fname
PRIVATE ALL
IF PARAMETERS() = 0
   fname = ''
ENDIF
   
width = 14 + LEN(m.fname)
okbut = 1
IF SET("SAFETY") = "ON" and !EMPTY(fname)
   DEFINE WINDOW confirm ;
       FROM SROWS()/2-3,SCOLS()/2-m.width/2 TO SROWS()/2+3,SCOLS()/2+m.width/2 ;
       DOUBLE FLOAT NOCLOSE NOGROW NOZOOM ;
       COLOR SCHEME 7
   ACTIVATE WINDOW confirm
   @ 1,3 SAY "Update "+m.fname+"?"
   @ 3,width/2-11 GET okbut FUNCTION "*H \!OK;\?Cancel" ;
      SIZE 1,10,2 COLOR SCHEME 7
      
   READ CYCLE
   RELEASE WINDOW confirm
   RETURN (okbut = 1)
   
ELSE
   RETURN .T.
ENDIF


************************************************
* PROCEED - Describe the configuration process *
************************************************
FUNCTION proceed
lmarg = 4
@ 0,0 SAY PADC("Configuring Your FoxPro"+IIF(extended," (X)","")+" Work Station", 80)
? "The ADDUSER utility enables you to customize your individual work station and "+;
   "configure it for optimal performance on your FoxPro multi-user system.";
   AT lmarg FUNCTION "v72"
?
?  "Each work station should have its own CONFIG.FP and FOXUSER files.  "+;
   "The CONFIG.FP file contains a set of options that specify the default  "+; 
   "environment when FoxPro starts up.  The FOXUSER file contains "+;
   "a variety of information affecting your operating environment "+;
   "including window sizes and positions, color sets, diary entries, etc.  "+;  
   "ADDUSER ensures that these two files exist either on your local "+;
   "drive or in a network directory assigned to your individual work "+;
   "station.";
   AT lmarg FUNCTION "v72"
?
? "There are other FoxPro files that should reside on your local hard "+; 
   "drive (if at all possible) in order to reduce the amount of traffic "+;
   "between the server and your work station.  ADDUSER enables "+;
   "you to specify the location of these files and stores this information "+;
   "in CONFIG.FP.";
   AT lmarg FUNCTION "v72"
?
? "Displayed below is the default directory name that will be used as a starting point "+;
  "for customizing this work station.  Make any changes and press ENTER "+;
  "to continue." AT lmarg FUNCTION "v72"
@ 22, 3 TO 24, 74 DOUBLE
@ 23, 6 GET defdir FUNCTION "s65"
READ
defdir = ALLTRIM(defdir)
DO getdefaults

@ 23, 6 TO 23, 73 CLEAR
@ 23, 5 GET ans;
   FUNCTION '*H \!Continue with configuration;\?Abort configuration procedure';
   SIZE 1, 33, 2 DEFAULT 1
READ CYCLE

RETURN IIF(ans = 1, .T., .F.)

**********************************************************************
* EXPLANATION - Display an explanation for each configuration option *
**********************************************************************
PROCEDURE explanation

IF savopt = option
	RETURN
ENDIF

ACTIVATE WINDOW explain
CLEAR
DO CASE
CASE option = 1
   msg = "The "+;
   "CONFIG.FP file contains a set of options that specify the default "+;
   "environment when FoxPro starts up.  It is typically small "+;
   "(less than 1024 bytes) but can be several thousand bytes if it contains "+;
   "many options.  Since it is accessed only on startup, performance will "+;
   "not be affected if it is located on the network.  It must, however, "+;
   "have either a unique location or filename that is designated for your "+;
   "work station."+cr+"WARNING:  A new SET command will be added to your "+;
   "AUTOEXEC.BAT file which tells FoxPro where to find your CONFIG.FP."
CASE option = 2
   msg = "FOXUSER, the FoxPro resource file, is actually a standard FoxPro "+;
   "database.  It contains a variety of "+;
   "information affecting your operating environment including window sizes "+;
   "and positions, color sets, diary entries, etc.  FOXUSER initially "+;
   "requires just a few kilobytes of disk space.  However, as you use FOXPRO interactively, "+;
   "new records are added to this file."+cr+"WARNING:  If you do not "+;
   "specify either a directory or filename that is unique to your work "+;
   "station, you should ensure that the FOXUSER file located in FoxPro's "+;
   "startup directory is a Read-Only file."
CASE option = IIF(extended, 0, 3)
   msg = "FoxPro's overlay file requires about 1.3MB of disk space.  This "+;
   "file is accessed very frequently while operating FoxPro so it "+;
   "should be located on the highest speed device available.  Usually, it is "+;
   "desirable to place this file on your local hard drive or on a RAM disk.  "+;
   cr+"On startup, FoxPro always ensures that there is a valid copy of this file "+;
   "in the directory you specified; therefore, you should never have to "+;
   "copy this file yourself."
CASE option = IIF(extended, 3, 4)
   msg = "For each editor session, FoxPro creates a temporary work file "+;
   "that can become as large as the original file being edited.  "+;
   "And, of course, you may have several editing sessions in progress simultaneously."+;
   cr+"For the best response time while editing your files you should "+;
   "place these files on your local drive if at all possible.  "+;
   "In any case, you should ensure that you have enough disk space on "+;
   "the device you specify for your editing sessions."
CASE option = IIF(extended, 4, 5)
   msg = "FoxPro creates temporary work files when SORTing and INDEXing.  The "+;
   "work files for sorting can be as much as three times the size of the "+;
   "original database.  The work files for indexing can be as much as three times "+;
   "the size of the resulting index file."+cr+"High speed access to these work "+;
   "files is a critical factor in performance for sorting and indexing "+;
   "so these files should be placed on your local drive if at all possible.  "+;
   "In any case, you should ensure that you have enough disk space on "+;
   "the device you specify for sorting and indexing your databases."
CASE option = IIF(extended, 5, 6)
   msg = "FoxPro uses a special work file for managing the programs you call "+;
   "while running your applications.  This file is generally less than "+;
   "256K bytes and is a good candidate to be situated on a RAM disk if you "+;
   "have one."
CASE option = 7
	IF extended
		msg = "By default, FoxPro (X) will use only 60KB of DOS memory "+;
		"(i.e., memory in the first 640KB) and reserve "+;
		"the rest for programs you execute with the RUN command and for "+;
		"your C and assembler language library routines.  If you "+;
		"are certain that you will not require these features, or if you know "+;
		"in advance that they will require some specific amount of memory, "+;
		"you can tell FoxPro how much memory to reserve for this purpose "+;
		"so it can use whatever is left over."
	ELSE
		msg = "By default, FoxPro takes advantage of all expanded memory (EMS) "+;
		"that it finds.  If you want to reserve all or part of EMS for use by "+;
		"other programs, you may limit the amount of EMS that is made available "+;
		"to FoxPro."+cr+"WARNING:  Certain older EMS emulators can cause problems "+;
		"for FoxPro.  If you have trouble with your EMS emulator, "+;
		"it may help to specify "+;
		"that FoxPro avoid using the first 64K of expanded memory.  (If it "+;
		"doesn't help, call Fox Software technical support.)" 
	ENDIF
ENDCASE

?? msg AT 1 FUNCTION "v67"
savopt = option

RETURN

***********************************************************************
* FLOPPY - If booting from floppy, display message to insert bootdisk *
***********************************************************************
PROCEDURE floppy

DEFINE WINDOW explain FROM 10,10 to 17,70 DOUBLE
ACTIVATE WINDOW explain
msg = "Your AUTOEXEC.BAT will be modified to tell FoxPro where to "+;
	"find your CONFIG.FP file.  Please insert your boot disk in Drive "+;
	bootdisk + ": and make sure that it is not write-protected."+;
	cr+"Press any key to continue..."
?? msg AT 1 FUNCTION "v57"
WAIT ""
RETURN

*****************************************************************************
* FINAL - Display message to reboot system before next invokation of FoxPro *
*****************************************************************************
PROCEDURE final
PARAMETER success

DEFINE WINDOW explain FROM 10,10 to 17,70 DOUBLE
ACTIVATE WINDOW explain
IF success
	msg = "Your AUTOEXEC.BAT file has been modified to tell FoxPro where to "+;
	"find your CONFIG.FP file.  Exit FoxPro in the normal manner and reboot "+;
	"your system before you "+;
	"start up FoxPro again in order for your changes to take effect."+;
	cr+"Press any key to continue..."
ELSE
	msg = "Unable to create or modify your AUTOEXEC.BAT and/or your "+;
	"CONFIG.FP file.  Please consult your network administrator."+cr+;
	"Press any key to continue..."
ENDIF
?? msg AT 1 FUNCTION "v57"
WAIT ""
RETURN

*********************************************
* ISDIR - Test to see if a directory exists *
*********************************************
FUNCTION isdir
PARAMETER dir

IF RIGHT(dir, 1) <> "\"
	dir = dir + "\"
ENDIF
dir = dir + IIF(RIGHT(dir, 1) = "\", "", "\") + SYS(3)
chan = FCREATE(dir)
IF chan >= 0
	= FCLOSE(chan)
	ERASE (dir)
ENDIF

RETURN IIF(chan >= 0, .T., .F.)