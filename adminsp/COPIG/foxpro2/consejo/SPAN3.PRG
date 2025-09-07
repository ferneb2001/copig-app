procedure span3
* Cedula Notificatoria (Nro 3)
* Al profesional comunicando falta presen.Boleta de Honorarios
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
select 1
use spprof index spprof
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
select 8
use exptes index exptesi
wkey=space(7)
wkey1=space(9)
wkeyex=space(10)
wmatri=0
wcateg=space(2)
wcopias=1
do while wmatri<>99999
    @04,01 clear to 23,78
    @04,30 say 'CEDULA NOTIFICATORIA NRO.3'
    @06,01 say 'Matricula:       Categor¡a:    Nombre:'
    @08,01 say 'Fs.  N§  :       Expte.Munic.N§:              Municipalidad:'
    @11,01 say 'Texto cabecera:'
    @18,01 say 'Fdo:'
   wmatri=0
   wcateg=space(2)
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if wmatri<>99999
      @06,29 get wcateg pict '!!'
      read
      wkey=str(wmatri,5)+wcateg
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
         wtitulo=titulo
         select 1
         seek(wkey1)
         if found()
            wnota=0
            wexpte=space(12)
            worden=space(6)
            wnomun=space(14)
            wfdo1=space(42)
            wfdo2=space(68)
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
            else
               wnomdpto=space(15)
            endif
            select 4
            seek(a.provin)
            if found()
               wnomprov=nombre
            else
               wnomprov=space(15)
            endif
            select 6
            seek(wtitulo)
            if found()
               wnomtit=titdesc
            else
               wnomtit=space(30)
            endif
            select 1                  
            @08,12 get wnota pict '9999'
            *  agregar rutina de busqueda de municipalidades
            @08,35 get wexpte pict 'XXXXXXXXXXXX'
            @08,61 get wnomun pict '!!!!!!!!!!!!!!'
            read
            @09,01 say domici
            @09,40 say wnomloc
            @09,56 say wnomdpto
            @10,01 say 'Fecha de providencia:'
            @10,50 say ' dd de mmmmmmmmm de 1xxx'
            wfechl=space(23)
            wenc0=space(39)
            wenc1=space(75)
            wenc2=space(75)
            wenc3=space(75)
            wenc4=space(75)
            wenc5=space(75)
            wenc6=space(75)
            @10,22 get wfechl
            read
            wexcod=space(1)
            wexnro=0
            wexano=0
            wop2=1
            @23,01 clear to 23,78
            @23,01 get wop2 pict '@*H \<1 Usa expedientes; \<2 Digita Texto' size 1,1
            read
            if wop2 = 1
               @19,01 say 'Letra: '
               @19,10 say 'N£mero:'
               @19,25 say 'a¤o: '
               @19,08 get wexcod pict '!'
               @19,19 get wexnro pict '99999'
               @19,30 get wexano pict '9999'
               read
               if lastkey()<>27
                  wkeyex=wexcod+str(wexnro,5)+str(wexano,4)
                  select 8
                  seek(wkeyex)
                  if found()
                     wenc2=cpto
                     wenc3=cpto2
                     wenc4=cpto3
                     wenc5=cpto4
                     wenc1='Expte. N§ '+str(wexnro,5)+'/'+wexcod+'/'+str(wexano,4)+' Caratulado: '+wenc0
                     @12,1 say wenc1
                     @13,1 say wenc2
                     @14,1 say wenc3
                     @15,1 say wenc4
                     @16,1 say wenc5
                     @17,1 say wenc6
                  else
                     @12,1 get wenc1
                     @13,1 get wenc2
                     @14,1 get wenc3
                     @15,1 get wenc4
                     @16,1 get wenc5
                     @17,1 get wenc6
                     read
                  endif
               else
                  @12,01 say 'debo irme'
               endif
               select 1   
            else
               @12,1 get wenc1
               @13,1 get wenc2
               @14,1 get wenc3
               @15,1 get wenc4
               @16,1 get wenc5
               @17,1 get wenc6
               read
            endif   
            @18,6 get wfdo1
            @19,6 get wfdo2
            read
            @20,01 say 'Indique cantidad de copias (m¡nimo 1)'
            @20,40 get wcopias pict '99'
            read
            wop=1
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               wop2=1
               @22,01 get wop2 pict '@*H \<Epson;\>Laser' size 1,1
               read
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               if wop2=2
                  ?chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
               endif
*               wcopias=2
               do while wcopias>0
                  ?'     CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
*                  ?'                    M E N D O Z A          '
                  ?'        Decreto Ley N§ 3485/63  -  Ley  5908  y  Ley 6377'
                  ?
                  ?chr(27)+chr(71)
                  ?? 'C E D U L A   N O T I F I C A T O R I A' at 20
                  ??chr(27)+chr(72)
                  ?
                  ? wenc1 at 1
                  ? wenc2 at 1
                  if wenc3<>space(75)
                     ? wenc3 at 1
                  endif
                  if wenc4<>space(75)   
                     ? wenc4 at 1
                  endif
                  if wenc5<>space(75)   
                     ? wenc5 at 1
                  endif
                  if wenc6<>space(75)   
                     ? wenc6 at 1
                  endif   
*                 ?
                  ?
                  ?'     En este Expte. recay¢, a fs. '
                  ??chr(27)+chr(71)
                  ??wnota pict '9999'
                  ??chr(27)+chr(72)
                  ??', la siguiente providencia de fecha'
                  ? wfechl at 5
                  ?? '.- - - - - - - - - - - - - - - - - - - - - -'
                  ?
                  ?'     VISTO. De conformidad con la comunicaci¢n efectuada por la Municipa-'
                  ?'     lidad de '
                  ?? wnomun
                  ?? ' a fs. 1, donde nos  informan que no ha  sido'
                  ?  '     presentado  en el Epte. Municipal N§ '
                  ?? wexpte pict 'XXXXXXXXXXXX'
                  ?? ' la correspondiente '
                  ?'     Boleta de Honorarios, con lo que de  acuerdo al Decreto Ley 3485/63,' 
                  ?'     se ha  transgredido el  cap¡tulo IV - R‚gimen de  Honorarios, en sus'
                  ?'     art¡culos  23§, 24§ y 27§ y el Decreto 1041/65 en sus art¡culos  8§,'
                  ?'     18§ y 19§, por DEPARTAMENTO ADMINISTRATIVO notif¡quese por el t‚rmi-'
                  ?'     no de DIEZ (10) DIAS HABILES a partir de su notificaci¢n, -con foto-'
                  ?'     copia de Fs. 1-, al ' 
                  ??wnomtit
                  ? '     '
                  ?? nombre
                  ?? ' Matr.  N§: '
                  ?? wmatri pict '99999'
                  ?? '  Categor¡a: '
                  ?? wcateg pict 'XX'
                  ?? ',' 
                  ?'     para que efect£e su  descargo y  cumpla, en el caso, con sus obliga-'
                  ?'     ciones estatuidas en la legislaci¢n  vigente. Caso  contrario, podr '
*                 ?? wexpte pict '9999'
                  ?'     ser pasible de aplicaci¢n de las sanciones pertinentes, inclu¡das en'
                  ?'     el Decreto Ley 3485/63, Cap¡tulo V, R‚gimen  Disciplinario, Art. 34§'
                  ?'     y 35§. Cumplido y  vencido el  t‚rmino  fijado, VUELVA a los efectos'
                  ?'     que diere lugar.- (Fdo.:) '
                  ?? wfdo1
                  if wfdo2<>space(68)
                     ?'     '
                     ?? wfdo2
                  endif   
                  ? 
                  ?'n3'   
             *     ?chr(27)+chr(72)
                  ??'MENDOZA,' at 35
                  ??day(date()) pict '99' at 44
                  ??' de '    at 46 
                  ??wmeses(month(date())) at 50
                  ??' de '    at 59
                  ??year(date()) at 63
                  ?
                  ?
*                 ?
*                 ?
                  ?
                  ?
                  ?
                  ?
                  ?'     Domicilio del Notificado:'
                  ??chr(27)+chr(71)
                  ?wnomtit at 5
                  ?nombre at 5
                  ?domici at 5
                  ?wnomloc at 5
                  ?wnomdpto at 5
                  ?wcp at 5
                  ??wnomprov at 12
                  ?
                  wcopias=wcopias-1
                  eject
               enddo
                select 7
                use spcedul
                append blank
                replace ce_nro    with wnota
                replace ce_fecha  with date()
                replace ce_orden  with worden
                replace ce_tipo   with 3
                replace ce_nota   with 0
                replace ce_matri  with wmatri
                replace ce_categ  with wcateg
                replace ce_fprov  with wfechl 
                replace ce_enc1   with wenc1
                replace ce_enc2   with wenc2
                replace ce_enc3   with wenc3
                replace ce_enc4   with wenc4
                replace ce_enc5   with wenc5
                replace ce_enc6   with wenc6
                replace ce_op2    with 2
                ce_xcod=space(1)
                ce_xnro=0
                ce_xano=0
                replace ce_munic  with wnomun
                replace ce_exptemu with wexpte
                replace ce_fenot  with {  /  /  }
               *eject
               set printer off
               set device to screen
            endif  
         else
            @06, 40 say 'No existe'  
         endif
      endif
  endif    
enddo
@04,01 clear to 23,78
close all   
close all
   