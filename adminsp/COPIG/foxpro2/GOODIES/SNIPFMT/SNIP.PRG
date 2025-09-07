*:*********************************************************************
*:
*: Procedure file: C:\FOXPRO2\SNIPFMT\SNIP.PRG
*:
*:         System: SnipFmt
*:         Author: Walter J. Kennamer
*:      Copyright (c) 1991, Fox Holdings, Inc.
*:  Last modified: 05/05/91      2:22
*:
*:  Procs & Fncts: BAILOUT
*:               : JUSTEXT()
*:               : FMT
*:               : WORDS
*:               : WORDNUM
*:               : DELFILE
*:
*:          Calls: BAILOUT        (procedure in SNIP.PRG)
*:               : ALERT.PRG
*:               : JUSTEXT()      (function  in SNIP.PRG)
*:               : FMT            (procedure in SNIP.PRG)
*:
*:           Uses: KEYWORDS.DBF   
*:               : SNIPTEMP.DBF   
*:
*:        Indexes: KEYNAME        (tag)
*:
*:    Other Files: PROWORDS.FXD
*:
*:      Documented 05/16/91 at 16:07               FoxDoc  version 2.07á
*:*********************************************************************
ON ERROR
CLOSE ALL
SET SAFETY OFF
SET TALK OFF
SET BELL OFF
SET DELETED ON
SET NOTIFY ON
CLEAR

PUBLIC saveall, caseindent, procind, filemode, abort

saveall  = .F.          && save all snippets without prompting?
caseind  = .F.          && .t. for an extra indent underneath case
procind  = .F.          && .t. for an extra indent underneath procedures
filemode = ''           && screen or menu file
abort    = .F.          && abnormal termination?
usetab   = .F.          && use tabs for indentation?

keyfname = SYS(2004)+'PROWORDS.FXD'
IF !FILE(keyfname)
   keyfname = LOCFILE('PROWORDS.FXD','FXD','Locate the PROWORDS.FXD file')
   IF EMPTY(keyfname)
      abort = .T.
      DO bailout
   ENDIF
ENDIF

IF FILE(keyfname)
   WAIT WINDOW 'Retrieving key words' NOWAIT
   CREATE TABLE keywords (keyname C(20))
   ZAP
   APPEND FROM (keyfname) SDF
   DELETE FOR INLIST(LEFT(keyname,1),'*') OR EMPTY(keyname)
   REPLACE ALL keyname WITH SUBSTR(keyname,2) FOR INLIST(LEFT(keyname,1),'%','!','@')
   PACK
   INDEX ON keyname TAG keyname
   WAIT CLEAR
   
   CREATE TABLE sniptemp (snipmemo m)
   APPEND BLANK
ELSE
   DO alert WITH "Could not find PROWORDS.FXD file.;Press any key to quit."
   abort = .T.
   DO bailout
ENDIF

fname = GETFILE('SCX;MNX;PRG','Which file contains the snippets?')
IF EMPTY(fname)
   DO bailout
ENDIF
DO CASE
CASE justext(m.fname) = 'PRG'
   filemode = 'PROGRAM'
CASE justext(m.fname) = 'SCX'
   filemode = 'SCREEN'
CASE justext(m.fname) = 'MNX'
   filemode = 'MENU'
OTHERWISE
   DO alert WITH m.fname + " is an unknown file type.;The file must be an SCX or MNX file."
   abort = .T.
   DO bailout
ENDCASE

IF filemode <> 'PROGRAM'
   IF !EMPTY(m.fname)
      SELECT 0
      USE (m.fname) ALIAS snipfile
   ELSE
      DO alert WITH "Filename not specified"    && should never happen
      abort = .T.
      DO bailout
   ENDIF
ENDIF

SCAN
   DO CASE
   CASE m.filemode = 'PROGRAM'
      DO fmt WITH m.fname
   CASE m.filemode = 'SCREEN'
      SELECT snipfile
      
      IF !EMPTY(VALID)
         DO fmt WITH "VALID"
      ENDIF
      IF !EMPTY(WHEN)
         DO fmt WITH "WHEN"
      ENDIF
      IF !EMPTY(proccode)
         DO fmt WITH "PROCCODE"
      ENDIF
      IF !EMPTY(setupcode)
         DO fmt WITH "SETUPCODE"
      ENDIF
      IF !EMPTY(ERROR)
         DO fmt WITH "ERROR"
      ENDIF
      IF !EMPTY(MESSAGE)
         DO fmt WITH "MESSAGE"
      ENDIF
      IF !EMPTY(SHOW)
         DO fmt WITH "SHOW"
      ENDIF
      IF !EMPTY(ACTIVATE)
         DO fmt WITH "ACTIVATE"
      ENDIF
      IF !EMPTY(DEACTIVATE)
         DO fmt WITH "DEACTIVATE"
      ENDIF
   CASE m.filemode = 'MENU'
      SELECT snipfile
      IF !EMPTY(COMMAND)
         DO fmt WITH "COMMAND"
      ENDIF
      IF !EMPTY(PROCEDURE)
         DO fmt WITH "PROCEDURE"
      ENDIF
      IF !EMPTY(setup)
         DO fmt WITH "SETUP"
      ENDIF
      IF !EMPTY(cleanup)
         DO fmt WITH "CLEANUP"
      ENDIF
   ENDCASE
ENDSCAN

abort = .F.    &&  ready for normal termination
DO bailout


*!*********************************************************************
*!
*!      Procedure: FMT
*!
*!      Called by: SNIP.PRG                      
*!
*!          Calls: ALERT.PRG
*!               : BAILOUT        (procedure in SNIP.PRG)
*!               : WORDNUM        (procedure in SNIP.PRG)
*!               : SAVEIT.SPR
*!
*!    Other Files: SNIPTEMP.PRG
*!               : SNIPTEMP.NEW
*!
*!*********************************************************************
PROCEDURE fmt
PARAMETERS snipname
break_str = ' +-/\*$#@()[]{}^%!=<>,;'

DO CASE
CASE filemode = 'PROGRAM'
   msg = "Documenting "+snipname
   IF FILE(snipname)
      COPY FILE (snipname) TO sniptemp.prg
   ELSE
      DO alert WITH snipname+';could not be found.'
      abort = .T.
      DO bailout
   ENDIF
CASE filemode = 'SCREEN'
   IF !EMPTY(name)
      msg = "Documenting "+PROPER(snipname)+" for "+name
   ELSE
      msg = "Documenting "+PROPER(snipname)
   ENDIF
   COPY MEMO (snipname) TO sniptemp.prg
CASE filemode = 'MENU'
   IF !EMPTY(PROMPT)
      msg = "Documenting "+PROPER(snipname)+" for ";
         +PROPER(CHRTRAN(PROMPT,'\?!<',''))
   ELSE
      msg = "Documenting "+PROPER(snipname)
   ENDIF
   COPY MEMO (snipname) TO sniptemp.prg
ENDCASE

fp = FOPEN('SNIPTEMP.PRG',0)
IF fp < 0
   DO alert WITH "Error "+ALLTRIM(STR(fp,4))+" opening SNIPTEMP.PRG"
   abort = .T.
   DO bailout
ENDIF

fp_out = FCREATE("SNIPTEMP.NEW",0)
IF fp_out < 0
   DO alert WITH "Error creating SNIPTEMP.NEW"
   abort = .T.
   DO bailout
ENDIF

thislevel = 0      && number of tab stops to indent
nextlevel = 0
iscontin  = .F.
hascontin = .F.

gtlinecnt = 0     && grand total line count
WAIT WINDOW msg NOWAIT
DO WHILE !FEOF(fp)
   gtlinecnt = gtlinecnt + 1
   IF gtlinecnt % 20 = 0
      WAIT WINDOW msg + 'ÄÄ'+ALLTRIM(STR(gtlinecnt,6))+' lines' NOWAIT
   ENDIF
   
   s = FGETS(fp)
   
   * write the comment as is, but don't echo earlier SNIPFMT headings
   firstchars = LEFT(ALLTRIM(s),2)
   IF LEFT(firstchars,1) = '*' 
      IF firstchars <> '*!'   
         numbytes = FPUTS(fp_out,s)  
      ENDIF
      LOOP
   ENDIF
   
   s = ALLTRIM(s)
   s = CHRTRAN(s,CHR(9),'')      && delete any tabs

   
   cmtpos = AT(CHR(38)+CHR(38),s)        && double ampersand
   IF cmtpos = 0
      cmtpos = 10000        && fake a big value for the comment position
   ENDIF
   
   indblquote = .F.
   insngquote = .F.
   i = 1
   DO WHILE i <= LEN(s)
      IF i = 1
         DO CASE
         CASE LEFT(s,1) = '*' OR LEFT(s,2) = CHR(38)+CHR(38) ;
               OR UPPER(LEFT(s,5)) = 'NOTE '
            i = LEN(s) + 1
            LOOP      && exit from the capitalization loop
         CASE LEFT(s,1) = '\'     && look for template comments too
            remain = SUBSTR(s,AT('\',s)+1)
            IF LEFT(LTRIM(remain),1) = '*')
               i = LEN(s) + 1
               LOOP      && exit from the capitalization loop
            ENDIF
         ENDCASE
      ENDIF
      
      
      DO WHILE i <= LEN(s) AND SUBSTR(s,i,1) $ break_str
         i = i + 1
      ENDDO
      
      indblquote = .F.
      insngquote = .F.
      DO CASE
      CASE SUBSTR(s,i,1) = '"'
         indblquote = .T.
         i = i + 1
      CASE SUBSTR(s,i,1) = "'"
         insngquote = .T.
         i = i + 1
      ENDCASE
      DO WHILE insngquote AND i <= LEN(s) AND SUBSTR(s,i,1) <> "'"
         i = i + 1
      ENDDO
      DO WHILE indblquote AND i <= LEN(s) AND SUBSTR(s,i,1) <> '"'
         i = i + 1
      ENDDO
      
      IF (insngquote OR indblquote) ;
            AND SUBSTR(s,i,1) $ (CHR(34) + CHR(39))
         i = i + 1
      ENDIF
      
      DO WHILE i <= LEN(s) AND SUBSTR(s,i,1) $ break_str
         i = i + 1
      ENDDO
      
      word_start = i
      thisword = ''
      DO WHILE i <= LEN(s) AND !(SUBSTR(s,i,1) $ break_str) ;
            AND ! (SUBSTR(s,i,1) $ CHR(34) + CHR(39))
         i = i + 1
      ENDDO
      
      thisword = SUBSTR(s,word_start,i - word_start)
      
      IF !EMPTY(thisword) AND LEN(thisword) < 4   && allow for abbrevs
         thisword = PADR(thisword,4)
      ENDIF
      IF !EMPTY(thisword)  ;
            AND i <= cmtpos ;
            AND SEEK(UPPER(thisword),"KEYWORDS")
         thisword = ALLTRIM(UPPER(thisword))
      ELSE
         thisword = ALLTRIM(LOWER(thisword))
      ENDIF
      
      DO CASE
      CASE word_start = 1
         s = thisword + SUBSTR(s,i)
      CASE i > LEN(s)
         s = SUBSTR(s,1,word_start-1)+thisword
      OTHERWISE
         s = SUBSTR(s,1,word_start-1)+thisword+SUBSTR(s,i)
      ENDCASE
      
   ENDDO
   
   IF !EMPTY(s)
      iscontin  = hascontin      && is this line itself a continuation?
      hascontin = RIGHT(TRIM(s),1) = ';'
      
      word1 = UPPER(wordnum(s,1))
      word2 = UPPER(wordnum(s,2))
      
      thislevel = nextlevel
      DO CASE
      CASE INLIST(word1,'IF','FOR','SCAN')
         nextlevel = thislevel + 1
      CASE word1 = 'CASE' OR word1 = 'OTHERWISE'
         thislevel = thislevel - 1
         nextlevel = thislevel + 1
      CASE INLIST(word1,'ENDIF','ENDDO','ENDFOR','ENDSCAN')
         thislevel = thislevel - 1
         nextlevel = thislevel
      CASE word1 = 'DO' AND (word2 = 'WHILE')
         nextlevel = thislevel + 1
      CASE word1 = 'DO' AND word2 = 'CASE'
         nextlevel = thislevel + 1
         IF caseind    && add an extra indent
            nextlevel = nextlevel + 1
         ENDIF
      CASE word1 = 'ELSE'
         thislevel = thislevel - 1
         nextlevel = thislevel + 1
      CASE word1 = 'ENDCASE'
         thislevel = thislevel - 1
         nextlevel = thislevel
         IF caseind      && take back the extra indent
            thislevel = thislevel - 1
            nextlevel = thislevel
         ENDIF
      CASE procind
         DO CASE
         CASE (word1 = 'PROCEDURE' OR word1 = 'FUNCTION')
            nextlevel = thislevel + 1
         CASE word1 = 'RETURN' AND thislevel = 2
            thislevel = 1
         ENDCASE
      ENDCASE
      
      DO CASE
      CASE hascontin AND !iscontin
         nextlevel = nextlevel + 1        && extra indent for continuations
      CASE iscontin AND !hascontin
         nextlevel = thislevel - 1        && take the indent back
      ENDCASE
      thislevel = MAX(thislevel,0)
      nextlevel = MAX(nextlevel,0)
      
      IF usetab
         s = REPLICATE(CHR(9),thislevel)+LTRIM(s)
      ELSE
         s = REPLICATE('   ',thislevel)+LTRIM(s)
      ENDIF
      
      IF word1 == 'PROCEDURE' OR word1 == 'FUNCTION'
         = FPUTS(fp_out,'*!'+REPLICATE('*',65))
         = FPUTS(fp_out,'*!')
         = FPUTS(fp_out,'*!      Procedure: '+word2)
         = FPUTS(fp_out,'*!')
         = FPUTS(fp_out,'*!'+REPLICATE('*',65))
         thislevel = 0
         nextlevel = 0
      ENDIF
   ENDIF
   
   numbytes = FPUTS(fp_out,s)
   
ENDDO

=FCLOSE(fp)
=FCLOSE(fp_out)
WAIT WINDOW msg + 'ÄÄ'+ALLTRIM(STR(gtlinecnt,6))+' lines' NOWAIT

IF saveall
   IF filemode = 'PROGRAM'
      COPY FILE sniptemp.new TO (snipname)
   ELSE
      APPEND MEMO (snipname) FROM sniptemp.new OVERWRITE
   ENDIF
ELSE        && prompt for save/discard choices
   SELECT sniptemp
   APPEND MEMO snipmemo FROM sniptemp.new OVERWRITE
   _CUROBJ = 2
   action = 3
   IF filemode <> 'PROGRAM' AND !EMPTY(snipfile->name)
      scrntitl = ' '+PROPER(snipname)+" for "+snipfile->name+' '
   ELSE
      scrntitl = ' '+PROPER(snipname)+' '
   ENDIF
   
   DO saveit.spr WITH action
   DO CASE
   CASE action = 1       && save this one snippet
      COPY MEMO snipmemo TO sniptemp.new
      IF filemode = 'PROGRAM'
         COPY FILE sniptemp.new TO (snipname)
      ELSE
         SELECT snipfile
         APPEND MEMO (snipname) FROM sniptemp.new OVERWRITE
      ENDIF
   CASE action = 2 OR saveall     && save all formatted snippets
      IF filemode = 'PROGRAM'
         COPY FILE sniptemp.new TO (snipname)
      ELSE
         COPY MEMO snipmemo TO sniptemp.new
         SELECT snipfile
         APPEND MEMO (snipname) FROM sniptemp.new OVERWRITE
      ENDIF
      saveall = .T.
   CASE action = 3       && discard the formatted snippet
   CASE action = 4       && cancel the program
      abort = .F.        && normal termination
      DO bailout
   ENDCASE
   IF filemode <> 'PROGRAM'
      SELECT snipfile      && back to the snippet file
   ENDIF
ENDIF
RETURN


*!*********************************************************************
*!
*!      Procedure: WORDS
*!
*!*********************************************************************
FUNCTION words
PARAMETERS s1,bk_strg

PRIVATE s1,bk_strg
DO CASE
CASE PARAMETERS() = 0
   RETURN ""
CASE PARAMETERS() = 1
   m->bk_strg = ' .,'
ENDCASE

m->s1 = CHRTRAN(m->s1,m->bk_strg,SPACE(LEN(m->bk_strg)))
m->s1 = ALLTRIM(m->s1)

DO WHILE AT('  ',m->s1) > 0
   m->s1 = STRTRAN(m->s1,'  ',' ')
ENDDO

RETURN ( OCCURS(" ",m->s1) + 1)

*!*********************************************************************
*!
*!      Procedure: WORDNUM
*!
*!      Called by: FMT            (procedure in SNIP.PRG)
*!
*!*********************************************************************
FUNCTION wordnum
PARAMETERS strg,w_num, bkstrg
PRIVATE strg,s1,w_num,ret_str,bkstrg
IF PARAMETERS() = 2
   bkstrg = ".,"
ENDIF
m->s1 = m->strg
m->s1 = CHRTRAN(m->s1,bkstrg,"  ")
m->s1 = ALLTRIM(m->s1)

DO WHILE AT('  ',m->s1) > 0
   m->s1 = STRTRAN(m->s1,'  ',' ')
ENDDO

DO CASE
CASE m->w_num > 1
   DO CASE
   CASE AT(" ",m->s1,m->w_num-1) = 0  && no word w_num past end of string.
      m->ret_str = ""
   CASE AT(" ",m->s1,m->w_num) = 0    && word w_num is last word in string.
      m->ret_str = SUBSTR(m->s1,AT(" ",m->s1,m->w_num-1)+1,255)
   OTHERWISE                              && word w_num is in the middle.
      strt_pos = AT(" ",m->s1,m->w_num-1)
      m->ret_str = SUBSTR(m->s1,strt_pos,;
         AT(" ",m->s1,m->w_num)+1 - strt_pos)
   ENDCASE
CASE m->w_num = 1
   IF AT(" ",m->s1) > 0        && get first word.
      m->ret_str = SUBSTR(m->s1,1,AT(" ",m->s1)-1)
   ELSE                        && there is only one word.  get it.
      m->ret_str = m->s1
   ENDIF
ENDCASE

m->ret_str = ALLTRIM(m->ret_str)

RETURN m->ret_str


*!*********************************************************************
*!
*!       Function: JUSTEXT()
*!
*!      Called by: SNIP.PRG                      
*!
*!*********************************************************************
FUNCTION justext
PARAMETERS filname
PRIVATE ALL
m.ext = ""
IF AT('.',m.filname) > 0
   m.ext = SUBSTR(m.filname,AT('.',m.filname)+1,3)
ENDIF
RETURN UPPER(m.ext)

*!*********************************************************************
*!
*!      Procedure: DELFILE
*!
*!      Called by: BAILOUT        (procedure in SNIP.PRG)
*!
*!*********************************************************************
FUNCTION delfile
PARAMETER fname
PRIVATE fname

IF FILE(m.fname)
   DELETE FILE (m.fname)
ENDIF
RETURN 0


*!*********************************************************************
*!
*!      Procedure: BAILOUT
*!
*!      Called by: SNIP.PRG                      
*!               : FMT            (procedure in SNIP.PRG)
*!
*!          Calls: DELFILE        (procedure in SNIP.PRG)
*!
*!*********************************************************************
PROCEDURE bailout
IF NOT abort
   WAIT WINDOW "Normal termination" NOWAIT
ENDIF
CLOSE ALL
CLEAR ALL
CLEAR WINDOW
SET PROCEDURE TO
=delfile('sniptemp.prg')
=delfile('sniptemp.new')
=delfile('keywords.dbf')
=delfile('keywords.cdx')
=delfile('keywords.bak')
=delfile('sniptemp.dbf')
=delfile('sniptemp.fpt')
=delfile('sniptemp.bak')
SET NOTIFY OFF
CANCEL
*: EOF: SNIP.PRG
