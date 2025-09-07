procedure spalpe44
* Notificaciones a profesionales avisando esta al cobro  matr. 2002
*  Todos los no habilitadas por a¤o de deuda un a¤o.
set talk off
dimension wmeses(12)
store 'enero' to wmeses(1)
store 'febrero' to wmeses(2)
store 'marzo'   to wmeses(3)
store 'abril'   to wmeses(4)
store 'mayo'    to wmeses(5)
store 'junio'   to wmeses(6)
store 'julio'   to wmeses(7)
store 'agosto'  to wmeses(8)
store 'setiembre' to wmeses(9)
store 'octubre'   to wmeses(10)
store 'noviembre' to wmeses(11)
store 'diciembre' to wmeses(12)
@04,01 clear to 23,78
@04,30 say 'Comunicacion de Deuda a Profesionales'
*@06,01 say 'Matricula:       Categor¡a:    Nombre:'
*@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
*@10,01 say 'A¤os      :'
*@12,01 say 'Ante:'
*@14,01 say 'Observacion:'
select 1
use spprof index spprof.idx
select 2
use spmatri index spmatri
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
select 6
use sptitu order titulo
wkey=space(7)
wkey1=space(9)
wmatri=0
wcateg=space(2)
wconta=0
wopc=0
wcp=space(4)
select 2
*wkey='       '
*seek(wkey)
do while not eof()
do while wmatri<>99999
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if wmatri=99999
   		exit
   else
   	 wkey=str(wmatri,5)+'A '
   	 seek(wkey)
   	 if found()
	    @15,1 say numero
		@15,10 say habili
*    if habili > 1991 and habili < 2002 
*       wmatri=numero
       @06,10 say numero
       wcateg=catego
       wkey1=str(dctipo,1)+str(dcnro,8)
       select 1
       seek(wkey1)
       if found()
         if estado = '1' or estado = 'A' or estado='0' or estado=' '
          if a.tipo<>1
            wnota=0
            @16,1 say dcnro
            @16,15 say a.spcpos
            if a.spcpos<>0
           		 wcp=str(a.spcpos,4)
            endif
            @17,15 say wcp pict '9999'
            wante=nombre
            wexpte=space(10)
            worden=space(12)
            @06,40 say nombre
            select 3
            seek(str(a.locali,3))
            if found()
               wnomloc=nombre
               if wcp='    '
               	wcp=cpost
               endif
               @16,30 say 'c.p.loc.'
               @17,30 say wcp pict '9999'	
            else
               wnomloc=space(15)
            endif
            select 5
            seek(str(a.dpto,3))
            if found()
               wnomdpto=nombre
               if wcp='    '
                  wcp=cpost
               endif   
               @16,40 say 'c.p.dep.'
               @17,40 say wcp pict '9999'	
            else
               wnomdpto=space(15)
            endif
            select 4
            seek(a.provin)
            if found()
               wnomprov=nombre
               if wcp='    '
                  wcp=cpost
               endif   
               @16,50 say 'c.p.pcia'
               @17,50 say wcp pict '9999'	
            else
               wnomprov=space(15)
            endif
            select 2
            wexptes=space(40)
            wpesos=space(65)
            wtitul=titulo
            wnomtit=space(30)
            select 6
            seek(wtitul)
            if found()
            	wnomtit=titdesc
            endif
            select 1
            wop=1
            @20,1 say 'C.Pos.F.'
            @20,10 say wcp
*            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1
*            read
            @23,01 clear to 23,78
            if wop=1
               wcopias=1
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               do while wcopias>0
                  ??chr(27)+chr(71)
                  ?'    CONSEJO   PROFESIONAL  DE  INGENIEROS  Y'
                  ?'                    GEOLOGOS'
                  ?'    Dto. Ley N§ 3485/63 - Dto.1041/65 - Ley 5908 - Dto.638/97 - Ley 6936'
                  ?
                  ?'    Mitre 617 - Planta Baja       '
                  ?'    5500 - Capital - M E N D O Z A'
                  ?'    Tel./Fax: 0261 - 4239178 ¢ 4231274'
                  ?'    E-mail  : ingenieros@copigmza.org.ar '
                  ??chr(27)+chr(72)
                  ?
                  ?
                  ?
                  ?'                              '
                  ?
                  ?'     Se¤or:'
                  ? wnomtit at 5 
                  ??'Matr¡cula: ' at 48
                  ??wmatri at 59 pict '9999'
                  ??wcateg at 64 
                  ??chr(27)+chr(71)
                  ?nombre at 5
                  ?domici at 5
                  ?rtrim(wnomloc)+' '+rtrim(wnomdpto) at 5
                  ?wcp at 5
                  ??wnomprov at 16
                  ??chr(27)+chr(72)
                  ?'     ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
                  ?
                  ?
                  ?'                              '
				  ?
                  ?' '
                  ?'MENDOZA,' at 37
                  ??day(date()) pict '99' at 46
                  ??' de '    at 48
                  ??wmeses(month(date())) at 52
                  ??' de '    at 61
                  ??year(date()) at 64
                  ?
                  ?'    De nuestra mayor consideraci¢n:                                     '
                  ?
                  ?'                    Tenemos el  agrado de  dirigirnos a  Ud. a fin de ha-'
                  ?'    cerle saber como matriculado en  este Consejo, que oara poder ejercer'
                  ?'    su profesi¢n debe estar debidamente habilitado con el  pago de la ma-'
                  ?'    tr¡cula anual. Seg£n nuestros registros adeuda las correspondientes a'
                  ?'    los a¤os 2002 a 2005.-                                               '
                  ?'                                                                        '
				  ?'                    Por lo tanto solicitamos su cancelaci¢n a la brevedad'
				  ?'    en nuestras oficinas.-                                              '
                  ?
*                  ?'                    Ello as¡, en virtud de lo dispuesto por el Decreto -'
*                  ?'    Ley 3485/63  (arts. 3ø, inciso c) y 41ø, inciso a)), seg£n modifica-'
*                  ?'    ci¢n introducida por Ley 6936.-                                     '
*                  ?
                 ?'                    En caso de haber cesado en su actividad profesional,'
                 ?'    deber  comunicarnos en forma  fehaciente esta circunstancia, deposi-'
                 ?'    tando de inmediato  en este  Consejo Profesional su carnet o creden-'
                 ?'    cial, ya que de lo contrario  se lo  considerar  en ejercicio activo'
                 ?'    (art. 6ø, Decreto Nø 1041/65).-                                     '
                 ?
*                 ?chr(27)+chr(71) 
*                ??chr(27)+chr(69)
*                  ?'                    El Consejo ha  previsto una serie de medidas para a-'
*                  ?'    liviar al m ximo el cumplimiento del pago del derecho de inscripci¢n'
*                  ?'    anual, por lo que lo invitamos a asesorarse en  nuestra sede Central'
*                  ?'    o delegaciones.-                                                    '
*                ??chr(27)+chr(72)
*                ??chr(27)+chr(70) 
                  ?
                  ?'                   Sin otro particular, nos complacemos en saludarlo muy'
                  ?'    atentamente.- '
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'    Ing.en Constr.SERGIO E GONZALEZ     Ing.en Electr¢n. DIONISIO DENAZIS'
*                  ?'              Ing. en Construcciones         Ing. en Construcciones  '
                  ?'                  SECRETARIO                        PRESIDENTE           '
                  wcopias=wcopias-1
                  eject
               enddo
              wconta=wconta+1     
              select 7
              use spmorato
              append blank
              replace nro    with wnota
              replace fecha  with date()
              replace orden  with worden
              replace tipo   with 1
 *             replace expte  with wexpte
              replace matri  with wmatri
              replace categ  with wcateg
              replace exptes with wexptes
 *             replace ante   with wante
 *             replace observac with wobservacion
              *eject
              set printer off
              set device to screen
            endif
          endif
          endif    
         else
            @06, 40 say 'No existe'  
         endif
      endif
    endif     
*   endif
*   enddo
   select 2
*   skip
   @20,60 say wconta
*   if wconta > 0
*      exit
*   endif
   enddo
*   if wconta > 1
*      exit
*   endif          
enddo
wop=0
@22,10 say 'Total de Registros '
@22,30 say  wconta pict '99999'
read
@04,01 clear to 23,78
close all   
return  
 