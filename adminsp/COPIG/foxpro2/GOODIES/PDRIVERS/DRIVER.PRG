*:*********************************************************************
*:
*: Procedure file: C:\PRO20\PDRIVERS\DRIVER.PRG
*:
*:         System: FoxPro Printer Driver Application
*:         Author: MCP
*:      Copyright (c) 1991, Fox Holdings, Inc.
*:  Last modified: 07/05/91     12:59
*:
*:  Procs & Fncts: PDONUNLOAD
*:               : PDDOCST
*:               : PDADVPRT
*:               : PDPAGEST
*:               : PDPAGEEND
*:               : PDOBJECT
*:               : PDLINEEND
*:               : PDDOCEND
*:
*:      Documented 07/09/91 at 09:27               FoxDoc  version 2.10
*:*********************************************************************

*!*********************************************************************
*!
*!      Procedure: PDONLOAD
*!
*!*********************************************************************
PROCEDURE PDonload
	_pdparms[43] = _pdparms[43] + 1
RETURN


*!*********************************************************************
*!
*!      Procedure: PDONUNLOAD
*!
*!*********************************************************************
PROCEDURE PDonunload

	IF _pdparms[43] = 1
		RELEASE _pdparms
	ELSE
		_pdparms[43] = _pdparms[43] - 1
	ENDIF
	
RETURN


*!*********************************************************************
*!
*!      Procedure: PDDOCST
*!
*!*********************************************************************
PROCEDURE PDdocst
PARAMETER m.doc_height, m.doc_width
PRIVATE m.ctlchars, m.flen

	*
	* Build the control characters for the initialization of the printer.
	* These are stored in specific positions of the array _pdparms.
	* Also, for reports, store the page height and width.
	*

	_pdparms[28] = m.doc_height

	*
	* Check for embeded pagelength to be substitued in at runtime.
	*

	m.flen = ""
	m.first = AT("{#}",_pdparms[5])
	IF m.first > 0

		m.flen = LEFT(_pdparms[5],m.first-1) + ;
			ALLTRIM(STR(m.doc_height)) + ALLTRIM(SUBSTR(_pdparms[5], m.first+3))

	ENDIF


	m.ctlchars = _pdparms[3] + _pdparms[10] + ;
		_pdparms[7] + _pdparms[8] + _pdparms[25] + ;
		_pdparms[26] + 	IIF(EMPTY(_pdparms[40]), ;
			 REPLICATE(IIF(EMPTY(_pdparms[22]), ;
			CHR(13)+CHR(10), _pdparms[22]), _pdparms[41]), _pdparms[40]) + ;
			m.flen


	_pdparms[29] = m.doc_width
	_pdparms[39] = .F.
	_pdparms[21] = .F.
	_pdparms[27] = 1

	IF NOT EMPTY(_pdparms[30])
		DO (LOCFILE(_pdparms[30], "PRG;APP;SPR;FXP;SPX", ;
			"Where is " + _pdparms[30] + "?")) WITH m.ctlchars
	ENDIF

RETURN m.ctlchars





*!*********************************************************************
*!
*!      Procedure: PDADVPRT
*!
*!*********************************************************************
PROCEDURE PDadvprt
PARAMETER m.fromhere, m.wheretogo
PRIVATE m.ctlchars

	*
	* Check to see if the current printer has control codes for horizontal
	* movement.  If so, then return the movement factor otherwise, use a
	* default movement scheme.
	*
	m.ctlchars = ""
	_pdparms[21] = .T.

	IF _pdparms[39]
		m.ctlchars = IIF(EMPTY(_pdparms[6]), CHR(12)+CHR(13), _pdparms[6])
		IF EMPTY(_pdparms[40])
			m.ctlchars = m.ctlchars + REPLICATE(IIF(EMPTY(_pdparms[22]), ;
				CHR(13)+CHR(10), _pdparms[22]), _pdparms[41])
		ENDIF
		_pdparms[39] = .F.
	ENDIF

	m.ctlchars = m.ctlchars + _pdparms[42]
	_pdparms[42]=""

	IF EMPTY(_pdparms[23])
		IF m.fromhere>m.wheretogo
			m.ctlchars = m.ctlchars + CHR(13) + SPACE(m.wheretogo)
		ELSE
			m.ctlchars = m.ctlchars + SPACE(m.wheretogo-m.fromhere)
		ENDIF
	ELSE
		IF m.fromhere = m.wheretogo
			m.ctlchars = m.ctlchars + ""
		ELSE
			m.ctlchars = m.ctlchars + _pdparms[23] + ALLTRIM(STR(m.wheretogo)) + _pdparms[24]
		ENDIF
	ENDIF

RETURN m.ctlchars



*!*********************************************************************
*!
*!      Procedure: PDPAGEST
*!
*!*********************************************************************
PROCEDURE PDpagest
PRIVATE m.ctlchars

	*
	* Reset the line counter and return a the codes to go to the next line.
	*
	_pdparms[27] = 1
	_pdparms[21] = .F.
	m.ctlchars = ""

	IF NOT EMPTY(_pdparms[31])
		DO (LOCFILE(_pdparms[31], "PRG;APP;SPR;FXP;SPX", ;
			"Where is " + _pdparms[31] + "?")) WITH m.ctlchars
	ENDIF


RETURN m.ctlchars


*!*********************************************************************
*!
*!      Procedure: PDPAGEEND
*!
*!*********************************************************************
PROCEDURE PDpageend
PRIVATE m.ctlchars

	m.ctlchars = ""

	IF _pdparms[27] > 1 AND _pdparms[21] = .T.
		m.ctlchars = IIF(EMPTY(_pdparms[6]), CHR(12)+CHR(13), _pdparms[6])
		IF EMPTY(_pdparms[40])
			m.ctlchars = m.ctlchars + REPLICATE(IIF(EMPTY(_pdparms[22]), ;
				CHR(13)+CHR(10), _pdparms[22]), _pdparms[41])
		ENDIF
	ENDIF

	IF NOT EMPTY(_pdparms[37])
		DO (LOCFILE(_pdparms[37], "PRG;APP;SPR;FXP;SPX", ;
			"Where is " + _pdparms[37] + "?")) WITH m.ctlchars
	ENDIF

RETURN m.ctlchars


*!*********************************************************************
*!
*!      Procedure: PDOBJECT
*!
*!          Calls: CHK_SPECIAL        (procedure in PS.PRG)
*!
*!*********************************************************************
PROCEDURE PDobject
PARAMETERS m.textline, m.attribs
PRIVATE m.char, m.ctlchars, m.endchars, m.i, m.bold, m.italic, m.super, m.sub, m.under, ;
		m.startchars


	m.startchars = ""
	m.endchars = ""
	m.ctlchars = ""
	_pdparms[21] = .T.

	IF _pdparms[39]
		m.ctlchars = IIF(EMPTY(_pdparms[6]), CHR(12)+CHR(13), _pdparms[6])
		IF EMPTY(_pdparms[40])
			m.ctlchars = m.ctlchars + REPLICATE(IIF(EMPTY(_pdparms[22]), ;
				CHR(13)+CHR(10), _pdparms[22]), _pdparms[41])
		ENDIF
		_pdparms[39] = .F.
	ENDIF

	m.ctlchars = m.ctlchars + _pdparms[42]
	_pdparms[42] = ""


	IF LEN(m.attribs) > 0			&& check to see if the object has any attributes
		STORE .F. TO m.bold, m.italic, m.super, m.sub, m.under
		m.attribs = UPPER(m.attribs)
		FOR m.i = 1 to LEN(m.attribs)	&& parse the attribute string

			m.char = SUBSTR(m.attribs, m.i, 1)

			*
			* Build the control characters for the current object's
			* attributes.  Build both the turning on and off of the
			* style.
			*
			DO CASE
				CASE m.char = "B" AND NOT m.bold
					IF NOT EMPTY(_pdparms[26])
						m.startchars = m.startchars + _pdparms[11]
						m.endchars = m.endchars + _pdparms[12]
					ENDIF
					m.bold = .T.

				CASE m.char = "I" AND NOT m.italic
					IF NOT EMPTY(_pdparms[25])
						m.startchars = m.startchars + _pdparms[15]
						m.endchars = m.endchars + _pdparms[16]
					ENDIF
					m.italic = .T.

				CASE m.char = "R" AND NOT m.super AND NOT m.sub
					m.startchars = m.startchars + _pdparms[17]
					m.endchars = m.endchars +  _pdparms[8] + _pdparms[18]
					m.super = .T.
				CASE m.char = "L" AND NOT m.sub AND NOT m.super
					m.startchars = m.startchars + _pdparms[19]
					m.endchars = m.endchars + _pdparms[8] + _pdparms[20]
					m.sub = .T.
				CASE m.char = "U" AND NOT m.under
					m.startchars = m.startchars + _pdparms[13]
					m.endchars = m.endchars + _pdparms[14]
					m.under = .T.
			ENDCASE

		ENDFOR

	ENDIF
	m.ctlchars = m.ctlchars + m.startchars + m.textline + m.endchars

	IF NOT EMPTY(_pdparms[34])
		DO (LOCFILE(_pdparms[34], "PRG;APP;SPR;FXP;SPX", ;
			"Where is " + _pdparms[34] + "?")) WITH m.ctlchars
	ENDIF

RETURN m.ctlchars



*!*********************************************************************
*!
*!      Procedure: PDLINEEND
*!
*!*********************************************************************
PROCEDURE PDlineend
PRIVATE m.ctlchars

	*
	* Check to see if the line number is greater than the page length.
	* If so, don't return anything and let the page start handle the movement.
	*
	m.ctlchars = ""
	IF _pdparms[27] >= _pdparms[28]
		_pdparms[27] = 1
		_pdparms[39] = .T.		&& At the bottom of page!
		_pdparms[21] = .F.
	ELSE
		IF _pdparms[21]			&& Output text yet?
			m.ctlchars = IIF(EMPTY(_pdparms[22]), CHR(13)+CHR(10), _pdparms[22])
		ELSE
			_pdparms[42] = _pdparms[42] + IIF(EMPTY(_pdparms[22]), CHR(13)+CHR(10), _pdparms[22])
		ENDIF

		_pdparms[27] = _pdparms[27] + 1
	ENDIF

	IF NOT EMPTY(_pdparms[36])
		DO (LOCFILE(_pdparms[36], "PRG;APP;SPR;FXP;SPX", ;
			"Where is " + _pdparms[36] + "?")) WITH m.ctlchars
	ENDIF

RETURN m.ctlchars



*!*********************************************************************
*!
*!      Procedure: PDDOCEND
*!
*!*********************************************************************
PROCEDURE PDdocend			&& Return any reset printer characters.
PRIVATE m.ctlchars

	m.ctlchars = IIF(EMPTY(_pdparms[3]), "", _pdparms[3])

	_pdparms[42] =""

	IF NOT EMPTY(_pdparms[38])
		DO (LOCFILE(_pdparms[38], "PRG;APP;SPR;FXP;SPX", ;
			"Where is " + _pdparms[38] + "?")) WITH m.ctlchars
	ENDIF

RETURN m.ctlchars
*: EOF: DRIVER.PRG
