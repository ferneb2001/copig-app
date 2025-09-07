*!*****************************************************************
*!
*!      Procedure: FORCEEXT
*!
*!*****************************************************************
FUNCTION forceext
* Force the extension of "filname" to be whatever ext is.
PARAMETERS filname,ext
PRIVATE ALL
IF SUBSTR(ext,1,1) = "."
   ext = SUBSTR(ext,2,3)
ENDIF

m.pname = justpath(m.filname)
m.filname = justfname(UPPER(ALLTRIM(m.filname)))
IF AT('.',m.filname) > 0
   m.filname = SUBSTR(m.filname,1,AT('.',m.filname)-1) + '.' + m.ext
ELSE
   m.filname = m.filname + '.' + m.ext
ENDIF
RETURN addbs(m.pname) + m.filname

*!*****************************************************************
*!
*!      Procedure: JUSTFNAME
*!
*!*****************************************************************
FUNCTION justfname
* Return just the filename (i.e., no path) from "filname"
PARAMETERS filname
PRIVATE ALL
IF RAT('\',m.filname) > 0
   m.filname = SUBSTR(m.filname,RAT('\',m.filname)+1,255)
ENDIF
IF AT(':',m.filname) > 0
   m.filname = SUBSTR(m.filname,AT(':',m.filname)+1,255)
ENDIF
RETURN ALLTRIM(UPPER(m.filname))

*!*****************************************************************
*!
*!      Procedure: JUSTSTEM
*!
*!*****************************************************************
FUNCTION juststem
* Return just the stem name from "filname"
PARAMETERS filname
PRIVATE ALL
IF RAT('\',m.filname) > 0
   m.filname = SUBSTR(m.filname,RAT('\',m.filname)+1,255)
ENDIF
IF AT(':',m.filname) > 0
   m.filname = SUBSTR(m.filname,AT(':',m.filname)+1,255)
ENDIF
IF AT('.',m.filname) > 0
   m.filname = SUBSTR(m.filname,1,AT('.',m.filname)-1)
ENDIF
RETURN ALLTRIM(UPPER(m.filname))

*!*****************************************************************
*!
*!      Procedure: JUSTEXT
*!
*!*****************************************************************
FUNCTION justext
* Return just the extension from "filname"
PARAMETERS filname
PRIVATE ALL
filname = JustFname(m.filname)   && prevents problems with ..\ paths
m.ext = ""
IF AT('.',m.filname) > 0
   m.ext = SUBSTR(m.filname,AT('.',m.filname)+1,3)
ENDIF
RETURN UPPER(m.ext)


*!*****************************************************************
*!
*!      Procedure: JUSTPATH
*!
*!*****************************************************************
FUNCTION justpath
* Return just the path name from "filname"
PARAMETERS filname
PRIVATE ALL
m.filname = ALLTRIM(UPPER(m.filname))
IF '\' $ m.filname
   m.filname = SUBSTR(m.filname,1,RAT('\',m.filname))
   IF RIGHT(m.filname,1) = '\' AND LEN(m.filname) > 1 ;
         AND SUBSTR(m.filname,LEN(m.filname)-1,1) <> ':'
      m.filname = SUBSTR(m.filname,1,LEN(m.filname)-1)
   ENDIF
   RETURN m.filname
ELSE
   RETURN ''
ENDIF

*!*****************************************************************
*!
*!      Procedure: ADDBS
*!
*!*****************************************************************
FUNCTION addbs
* Add a backslash to a path name, if there isn't already one there
PARAMETER pathname
PRIVATE ALL
m.pathname = ALLTRIM(UPPER(m.pathname))
IF !(RIGHT(m.pathname,1) $ '\:') AND !EMPTY(m.pathname)
   m.pathname = m.pathname + '\'
ENDIF
RETURN m.pathname


*!*****************************************************************
*!
*!      Procedure: INVERT
*!
*!*****************************************************************
PROCEDURE invert
* Invert (i.e., index on all fields) the "filname" database

PARAMETERS filname
PRIVATE filname
comp_stat = SET("COMPATIBLE")
safe_stat = SET("SAFETY")
SET COMPATIBLE TO FOXPLUS
SET SAFETY OFF

m.in_area = SELECT()          && currently selected area

m.fstem = juststem(m.filname)
IF USED(m.fstem)
   SELECT (m.fstem)
ELSE
   SELECT 0
   USE (m.filname)
ENDIF


FOR i = 1 TO FCOUNT()
   fldname = FIELD(i)
   IF TYPE(m.fldname) <> "M"
      WAIT WINDOW "Indexing on "+m.fldname NOWAIT
      INDEX ON &fldname TAG (m.fldname)
   ENDIF
ENDFOR

IF m.in_area <> SELECT()
   USE
ENDIF
SELECT (m.in_area)
IF m.comp_stat = "ON" OR m.comp_stat = "DB4"
   SET COMPATIBLE TO DB4
ENDIF
IF m.safe_stat = "ON"
   SET SAFETY ON
ENDIF
RETURN


*!*****************************************************************
*!
*!      Procedure: OPENDBF
*!
*!*****************************************************************
FUNCTION opendbf
* Open a database and return the alias name, or an empty string
*   if the database could not be opened.  Prompt user to find 
*   database if necessary
PARAMETERS fname
PRIVATE fname, stem
IF FILE(m.fname)
   m.stem = juststem(m.fname)
   IF USED(m.stem)
      SELECT (m.stem)
   ELSE
      SELECT 0
      m.fname = LOCFILE(m.fname,'DBF',;
          'Please locate the '+juststem(m.fname)+' database')
      IF EMPTY(m.fname)
         RETURN ''
      ELSE
         USE (m.fname)
      ENDIF
   ENDIF
   RETURN ALIAS()
ELSE
   RETURN ''
ENDIF

*!*****************************************************************
*!
*!      Procedure: ACTWIN
*!
*!*****************************************************************
FUNCTION actwin
* Activate window wind_name

PARAMETER wind_name
PRIVATE ALL
wind_name = UPPER(ALLTRIM(m.wind_name))
IF !EMPTY(m.wind_name) AND WEXIST(m.wind_name)
   ACTIVATE WINDOW (m.wind_name)
ENDIF
RETURN ''


*!*****************************************************************
*!
*!      Procedure: ALERT
*!
*!*****************************************************************
PROCEDURE alert
* Display an error message, automatically sizing the message window
*    as necessary.  Semicolons in "strg" mean "new line".
PARAMETERS strg

in_talk = SET('TALK')
SET TALK OFF
in_cons = SET('CONSOLE')

m.numlines = OCCURS(';',m.strg) + 1

DIMENSION alert_arry[m.numlines]
m.remain = m.strg
m.maxlen = 0
FOR i = 1 TO m.numlines
   IF AT(';',m.remain) > 0
      alert_arry[i] = SUBSTR(m.remain,1,AT(';',m.remain)-1)
      alert_arry[i] = CHRTRAN(alert_arry[i],';','')
      m.remain = SUBSTR(m.remain,AT(';',m.remain)+1)
   ELSE
      alert_arry[i] = m.remain
      m.remain = ''
   ENDIF
   IF LEN(alert_arry[i]) > SCOLS() - 6
      alert_arry[i] = SUBSTR(alert_arry[i],1,SCOLS()-6)
   ENDIF
   IF LEN(alert_arry[i]) > m.maxlen
      m.maxlen = LEN(alert_arry[i])
   ENDIF
ENDFOR

m.top_row = INT( (SROWS() - 4 - m.numlines) / 2)
m.bot_row = m.top_row + 3 + m.numlines

m.top_col = INT((SCOLS() - m.maxlen - 6) / 2)
m.bot_col = m.top_col + m.maxlen + 6

DEFINE WINDOW alert FROM m.top_row,m.top_col TO m.bot_row,m.bot_col;
   DOUBLE COLOR SCHEME 7
ACTIVATE WINDOW alert

FOR i = 1 TO m.numlines
   @ i,3 SAY PADC(alert_arry[i],m.maxlen)
ENDFOR

SET CONSOLE OFF
keycode = INKEY(0,'HM')
SET CONSOLE ON

RELEASE WINDOW alert

IF m.in_talk = "ON"
   SET TALK ON
ENDIF
IF m.in_cons = "OFF"
   SET CONSOLE OFF
ENDIF


*!*****************************************************************
*!
*!      Procedure: APPERROR
*!
*!*****************************************************************
PROCEDURE apperror
* Simple ON ERROR routine for FoxApp application

PARAMETERS e_program,e_message,e_source,e_lineno,e_error
DO CASE
CASE e_error = 217     && invalid display mode
   SET CURSOR OFF
   WAIT WINDOW "That display mode is not available on your computer."
   SET CURSOR ON
   RETURN
CASE e_error = 1707    && CDX not found.  Ignore it.
   RETURN
OTHERWISE

   ON ERROR
   m.e_source = ALLTRIM(m.e_source)
   DO alert WITH 'Line No.: '+ALLTRIM(STR(m.e_lineno,5))+';' ;
                 +'Program: '+m.e_program +';' ;
                 +'  Error: '+m.e_message +';' ;
                 +' Source: '+IIF(LEN(m.e_source)<50,;
                              m.e_source,SUBSTR(m.e_source,1,50)+'...')
   ON KEY
   CLOSE ALL
   CLEAR PROGRAM
   CLEAR WINDOW
   POP MENU _MSYSMENU TO MASTER
   CANCEL
ENDCASE   
RETURN

