procedure spalee3
* Notificaciones a empresas por deuda    
*  Todas las no habilitadas por a¤o de deuda.
set talk off
SET CENTURY ON
SET DATE DMY
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
wdate={28/11/2000}
select 2
*wkey='       '
*seek(wkey)
wcanti=1
do while not eof()
                          *do while wmatri<>99999
                          *   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
                          *   @06,12 get wmatri pict '99999'
                          *   read
   @23,01 clear to 23,78
   do while wcanti > 0 and wcanti < 3
    if habili = 2000  
*    if numero = 19 or numero = 1156
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
               wcopias=1
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               do while wcopias>0
                  ??chr(27)+chr(71)
                  ?'    CONSEJO   PROFESIONAL  DE  INGENIEROS  Y'
                  ?'                    GEOLOGOS'
                  ?'    Decreto  Ley  N§  3485/63   -   Ley 5908'
                  ?'    Mitre 617  1§ P. -Tel.-Fax (0261)4239178'
                  ?'    5500  -  M E N D O Z A'
                  ??chr(27)+chr(72)
                  ?
                  ?'                '
                  ?'                              '
                  ?
                  ?
*                  ??chr(27)+chr(71)
*                  ??chr(27)+chr(72)
*                  ??chr(27)+chr(71)
                   ?
*                  ??chr(27)+chr(72)
                   ? 
                  ?'         Se¤or/es:'
                  ??chr(27)+chr(71)
*                  ?wnomtit at 9
                  ?wmatri at 50
                  ??wcateg at 62 
                  ?nombre at 9
                  ?domici at 9
                  ?rtrim(wnomloc)+' '+rtrim(wnomdpto) at 9
*                  ??wnomdpto at 19
                  ?wcp at 9
                  ??wnomprov at 16
*                  ??wmatri at 50
                  ??chr(27)+chr(72)
*                  ?'    P R E S E N T E:'
                  ?'         ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
                  ?
                  ?
                  ?
                  ?'-'
                  ?
                  ?
                  ?'MENDOZA,' at 42
                  ??day(wdate) pict '99' at 51
                  ??' de '    at 53
                  ??wmeses(month(wdate)) at 57
                  ??' de '    at 66
                  ??year(wdate) at 69
                  ?
*                  ?
                  ?'                                      Ref.:Actualizaci¢n Matr¡culas Empresas.'
                  ?
                  ?'                              El CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
                  ?'         DE MENDOZA en cumplimiento de las normas vigentes, habiendo detecta-'
                  ?'         do transgresiones al Decreto Ley 3485/63 y su  Reglamentario 1041/65'
                  ?'         y de la Ley de Desregulaci¢n 5908 y su Decreto Reglamentario 638/97,'
                  ?'         comunica a Usted/es que, de  acuerdo a nuestros Registros Oficiales,'
                  ?'         vuestra Empresa adeuda la matr¡cula correspondiente al a¤o 2000.-   '
                  ?
				  ?'                              Por  tal  motivo lo/s  invitamos a  concurrir a'                               
                  ?'         nuestras oficinas sitas en Avda. Mitre 617 - 1er. Piso Ciudad - Men-'
*                 ??chr(27)+chr(71) at 52
*                 ??wexptes at 52
*                 ??chr(27)+chr(72)
				  ?'         doza, en el horario de Lunes a Viernes de 8.30 hs. a 12.30 hs., don-'
                  ?'         de se le/s suministrar  mayor informaci¢n a los efectos de facilitar'
                  ?'         la regularizaci¢n de la Empresa ante este Consejo Profesional.-     '
                  ?
                  ?'                              Si su Empresa ha cesado en su actividad, le re-'
                  ?'         querimos tenga la gentileza de  acercarnos la pertinente  documenta-'
                  ?'         ci¢n a fin de darle de Baja de nuestros archivos.-                  '
                  ?
                  ?'                              Sin otro particular y quedando a vuestra dispo-'
                  ?'         sici¢n, saludamos a Usted/es atentamente.-                          '
                  ?
                  ?'                                '
                  ?'         S.R.P./env.            '
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'                  RAUL H. DELLE DONNE                   SERGIO E. GONZALEZ  '
                  ?'                Ing. en Construcciones               Ing. en Construcciones '
                  ?'                      SECRETARIO                           PRESIDENTE       '
                  wcopias=wcopias-1
                  eject
               enddo
              wconta=wconta+1
              wcanti=wcanti+1     
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
*       enddo  
      endif   
*   endif
   select 2
   skip
   @20,60 say wconta
*   if wconta > 0
*      exit
*   endif
  enddo
*   if wconta > 1
*      exit
*   endif          
enddo
@04,01 clear to 23,78
close all   
return   