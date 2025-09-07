*:*********************************************************************
*:
*: Procedure file: H:\FOXPRO2\SPALEMG7.PRG
*:
*:         System: spalemg7
*:         Author: eap
*:      Copyright (c) 1996, eap
*:  Last modified: 09/10/96     14:26
*:
*:  Procs & Fncts: SPALEMG7
*:               : IMPRIME
*:               : ROTULO
*:               : TITULOS
*:               : TITULOSB
*:               : ARMA
*:
*:          Calls: ARMA               (procedure in SPALEMG7.PRG)
*:               : IMPRIME            (procedure in SPALEMG7.PRG)
*:
*:           Uses: ENTIDADES.DBF      
*:               : ENTIDTM.DBF        
*:               : ENTIDTMS.DBF       
*:
*:      CDX files: ENTIDADES.CDX
*:
*:      Documented 09/11/96 at 14:28               FoxDoc  version 2.10
*:*********************************************************************
PROCEDURE spalemg7
*rotulos de Entidades
SET TALK OFF
SET DELETE ON
@04,01 CLEAR TO 23,78
@04,28 SAY 'ROTULOS DE ENTIDADES'
SELECT 1
USE entidades ORDER entnro
SELECT 3
SET EXCLUSIVE ON
SET SAFETY OFF
wfecha=DATE()
USE entidtm
ZAP
SET EXCLUSIVE OFF
whabi=' '
wop=1
wnomtit=SPACE(25)
@08,02 SAY 'Clases'
@10,02 GET wop PICT '@*RVT \<Habilitados;\<No habilitados;\<Todos';
   COLOR SCHEME 5
READ
@23,01 CLEAR TO 23,78
*if wop<>1
IF wop=1
   whabi='S'
ELSE
   IF wop=2
      whabi='N'
   ELSE
      whabi=' '
   ENDIF
ENDIF
wop=1
wdpto=0
wnomdpto=SPACE(15)
@23,01 CLEAR TO 23,78
wop=1
@23,30 GET wop PICT '@*H \<Salir;\<Imprimir'
READ
IF wop=2
   SELECT 1
   USE entidades
   GO TOP
   SET CLOCK ON
   @14,21 TO 16,58
   @15,23 SAY 'Aguarde..,estoy armando un archivo' COLOR N/W*
   DO WHILE .NOT. EOF()
      IF entcod= 2
         DO arma
         SELECT 1
      ENDIF
      SKIP
   ENDDO
   *@12,01 clear to 12,78
   @15,23 SAY '     Aguarde..,voy a ordenarlo   ' COLOR N/W*
   SELECT 3
   SORT TO entidtms ON enttmno1
   DO imprime
ENDIF
@04,01 CLEAR TO 23,78
CLOSE ALL
RETURN

*!*********************************************************************
*!
*!      Procedure: IMPRIME
*!
*!      Called by: SPALEMG7.PRG                      
*!
*!          Calls: ROTULO             (procedure in SPALEMG7.PRG)
*!
*!           Uses: ENTIDTMS.DBF       
*!
*!*********************************************************************
PROCEDURE imprime
wop=1
@23,01 CLEAR TO 23,78
@15,23 SAY 'Verifique estado de la impresora  '
@23,34 GET wop PICT '@*H LP\<1;LP\<2;\<Salir'
READ
IF wop<>3
   @15,23 SAY '     En proceso de impresi¢n    '
   SELECT 1
   USE entidtms
   GO TOP
   SET CONSOLE OFF
   SET PRINTER ON
   SET DEVICE TO PRINTER
   IF wop=1
      SET PRINTER TO 'LPT1'
   ELSE
      SET PRINTER TO 'LPT2'
   ENDIF
   *   ???chr(27)+chr(67)+chr(72)
   *   ???chr(27)+chr(48)
   *   ???chr(27)+chr(15)
   wlin=0
   whoja=0
   wnum=1
   DO WHILE .NOT. EOF()
      *         select 1
      IF wnum = 1
         wmat1 = enttmnum
         *        wcat1 = wcateg
         wnom1 = enttmno1
         wnom2 = enttmn02
         wnom3 = enttmn03
         wdom1 = enttmdi1
         wloc1 = enttmdi2
         wdpto1 = enttmpci
         *        wcpo1 = ENTTMPAI
         wpcia1 = enttmpai
         wnum = wnum+1
      ELSE
         IF wnum = 2
            wmat2 = enttmnum
            *           wcat2 = wcateg
            wnom4 = enttmno1
            wnom5 = enttmn02
            wnom6 = enttmn03
            wdom2 = enttmdi1
            wloc2 = enttmdi2
            wdpto2 = enttmpci
            *           wcpo2 = enttmpai
            wpcia2 = enttmpai
            DO rotulo
            wnum = 1
         ENDIF
      ENDIF
      SKIP
   ENDDO
   *   ???chr(27)+chr(18)
   ???CHR(27)+CHR(50)
   ???CHR(27)+CHR(80)
   EJECT
   SET PRINTER OFF
   SET DEVICE TO SCREEN
   SET SAFETY ON
ENDIF
@04,01 CLEAR TO 23,78
RETURN


*!*********************************************************************
*!
*!      Procedure: ROTULO
*!
*!      Called by: IMPRIME            (procedure in SPALEMG7.PRG)
*!
*!*********************************************************************
PROCEDURE rotulo
?
*? wmat1 at 6
*?? '-'
*?? wcat1
*?? wmat2 at 45
*?? '-'
*?? wcat2
*? wtitu1 at 6
*?? wtitu2 at 45
?
? wnom1 AT 1
?? wnom4 AT 39
? wnom2 AT 1
?? wnom5 AT 39
?wnom3  AT 1
?? wnom6 AT 39
? wdom1 AT 1
?? wdom2 AT 39
? wloc1 AT 1
?? wloc2 AT 39
? wdpto1 AT 1
?? wpcia1 AT 16
?? wdpto2 AT 39
?? wpcia2 AT 55
?
*?
RETURN

*!*********************************************************************
*!
*!      Procedure: TITULOS
*!
*!*********************************************************************
PROCEDURE titulos
IF wlin > 85
   EJECT
   whoja=whoja+1
ENDIF
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA'
?
?'LISTADO DE ENTIDADES    ' AT 20
?? wcateg AT 57
IF whabi='S'
   ??' (habilitados)' AT 61
ELSE
   IF whabi='N'
      ??' (no habilitados)' AT 61
   ENDIF
ENDIF
??'Fecha: ' AT 80
?? wfecha  AT 87
??'HOJA NRO. ' AT 110
??whoja PICT '999'
?
? 'MATRIC. CAT.   NOMBRE'
?? ' DOMICILIO' AT 47
?? ' TELEFONO ' AT 78
wlin = 5
RETURN
*!*********************************************************************
*!
*!      Procedure: TITULOSB
*!
*!*********************************************************************
PROCEDURE titulosb
?
?wnomtit AT 55
?
*?'MATRIC. CAT.   NOMBRE'
*??'DOMICILIO' at 47
*?
wlin=wlin+3
RETURN

*!*********************************************************************
*!
*!      Procedure: ARMA
*!
*!      Called by: SPALEMG7.PRG                      
*!
*!*********************************************************************
PROCEDURE arma
SELECT 3
APPEND BLANK
REPLACE enttmnum WITH a.entnro
REPLACE enttmno1 WITH a.entnombre
REPLACE enttmn02 WITH a.entnomb2
REPLACE enttmn03 WITH a.entnomb3
REPLACE enttmdi1 WITH a.entdir1
REPLACE enttmdi2 WITH a.entdir2
REPLACE enttmpci WITH a.entpcia
REPLACE enttmpai WITH a.entpais
*      endif
*   endif
RETURN
*: EOF: SPALEMG7.PRG
