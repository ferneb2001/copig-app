procedure spalee3b
* Notificaciones a empresas por deuda    
*  Todas las no habilitadas por a¤o de deuda.
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
@04,30 say 'Comunicacion de Deuda a Empresas'
*@06,01 say 'Matricula:       Categor¡a:    Nombre:'
*@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
*@10,01 say 'A¤os      :'
*@12,01 say 'Ante:'
*@14,01 say 'Observacion:'
select 1
use spprofe index spprofe
select 2
use spmatrie index spmatrie
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
*select 6
*use sptitu order titulo
wkey=space(7)
wkey1=space(9)
wmatri=0
wcateg=space(2)
wconta=0
select 2
*wkey='       '
*seek(wkey)
*do while not eof()
                          *do while wmatri<>99999
                          *   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
                          *   @06,12 get wmatri pict '99999'
                          *   read
   @23,01 clear to 23,78
   do while numero > 0 and numero < 30
	@15,1 say numero
	@15,10 say habili
    if habili >= 1991 AND habili < 2000
       wmatri=numero
       @06,10 say numero
       wcateg=catego
       wkey1=str(dctipo,1)+str(dcnro,8)
       select 1
       seek(wkey1)
       if found()
         if estado = '1' or estado = 'A'
            wnota=0
            wcp='    '
            wante=nombre
            wexpte=space(10)
            worden=space(12)
            @06,40 say nombre
            select 3
            seek(str(a.locali,3))
            if found()
               wnomloc=nombre
               wcp=cpost
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
            else
               wnomprov=space(15)
            endif
            select 2
            wexptes=space(40)
            if habili = 2000
               wexptes='2001.-'
            else
               wanoin=habili+1
               wexptes=str(wanoin,4)+' a '+'2001.-'
            endif
            wtitul=titulo
            wnomtit=space(30)
            select 1
*            @10,14 get wexptes
*            read
            wop=1
*            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1
*            read
            @23,01 clear to 23,78
            if wop=1
               wcopias=2
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               do while wcopias>0
                  ??chr(27)+chr(71)
                  ?'    CONSEJO   PROFESIONAL  DE  INGENIEROS  Y'
                  ?'                    GEOLOGOS'
                  ?'    Decreto  Ley  N§  3485/63   -   Ley 5908'
                  ?'    Mitre 617  1§ P. - Tel.-Fax (061) 239178'
                  ?'    5500  -  M E N D O Z A'
                  ??chr(27)+chr(72)
                  ?
                  ?'                '
                  ?'                              '
                  ?
                  ?'              Se¤or/es:'
                  ??chr(27)+chr(71)
                  ?wmatri at 50
                  ??wcateg at 62 
                  ?nombre at 14
                  ?domici at 14
                  ?rtrim(wnomloc)+' '+rtrim(wnomdpto) at 14
                  ?wcp at 14
                  ??wnomprov at 21
                  ??chr(27)+chr(72)
                  ?'              ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
                  ?
                  ?
                  ?'-'
                  ?
                  ?
                  ?'MENDOZA,' at 42
                  ??day(date()) pict '99' at 51
                  ??' de '    at 53
                  ??wmeses(month(date())) at 57
                  ??' de '    at 66
                  ??year(date()) at 69
                  ?
                  ?'         De nuestra consideraci¢n:                                           '
                  ?
                  ?'                         Nos dirigimos a Ud(es) a fin de notificarle que, se-'
                  ?'         g£n nuestro  Registro  oficial, institu¡do por el art 8ø del Decreto'
                  ?'         Ley 3485/63, esa Empresa adeuda  actualmente  las matr¡culas corres-'
                  ?'         podientes a los a¤os  '
                  ?? wexptes
                  ?
                  ?'                         Ante esta situaci¢n, Ud(es) deber (n):              '
                  ?
                  ?'         a) Cancelar en nuestra sede en un plazo  perentorio de DIEZ DIAS HA-'
                  ?'            BILES a partir de la presente notificaci¢n,  el monto  correspon-'
				  ?'            diente a las matr¡culas  adeudadas mas los  intereses punitorios,'                               
                  ?'            raz¢n por la cual se encuentra INHABILITADA (art.5ø y 6ø del Dec.'
				  ?'            1041/65) y pasible de las sanciones establecidas por el art. 32ø,'
                  ?'            segunda parte del Dec.Ley 3485/63 (Multa de diez a  cincuenta ve-'
                  ?'            ces el valor de la inscripci¢n).-                                '
                  ?
                  ?'         b) En el caso del cese de actividades de la Empresa, comunicar feha-'
                  ?'            cientemente a este Consejo dicha  situaci¢n, acompa¤ando la docu-'
                  ?'            mentaci¢n  probatoria de haber sido dada de baja en las  reparti-'
                  ?'            nes correspondientes. Caso contrario ser   considerada en ejerci-'
                  ?'            cio activo (art 6ø Dec. 1041/65).-                               '
                  ?
                  ?'                         Por lo expuesto, y en ejercicio del Poder de Polic¡a'
                  ?'         otorgado a nuestra Entidad por el Dec. Ley 3485/63, la emplazamos en'
                  ?'         el t‚rmino perentorio de  DIEZ DIAS HABILES a  regularizar su situa-'
                  ?'         ci¢n ante este Consejo, bajo apercibimiento de aplicarle las sancio-'
                  ?'         nes previstas legalmente.-                                          '
                  ?
                  ?'                         Sin otro particular, la saludamos atte.-            '
                  ?
                  ?
*                 ?'                        SERGIO E. GONZALEZ              DIONISIO DENAZIS    '
*                 ?'                      Ing. en Construcciones           Ing. en Electr¢nica  '
*                 ?'                            SECRETARIO                     PRESIDENTE       '
                  wcopias=wcopias-1
                  eject
               enddo
              wconta=wconta+1     
              select 7
              use spmoratp
              append blank
              replace nro    with wnota
              replace fecha  with date()
              replace orden  with worden
              replace tipo   with 3
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
         else
            @06, 40 say 'No existe'  
         endif
   endif
   select 2
   skip
   @20,60 say wconta
*   if wconta > 0
*      exit
*   endif
*   enddo
*   if wconta > 1
*      exit
*   endif          
enddo
@04,01 clear to 23,78
close all   
return  
 