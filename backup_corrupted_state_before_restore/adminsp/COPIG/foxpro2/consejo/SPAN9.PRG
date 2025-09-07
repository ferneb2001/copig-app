 procedure span9
* Nota inicio de expedientes por Secc. Certif. y Hab.Prof.
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
wkey=space(7)
wkey1=space(9)
wkeyex=space(10)
wmatri=0
wcateg=space(2)
wcopias=1
do while wmatri<>99999
    @04,01 clear to 23,78
    @04,30 say 'NOTA INICIO EXPEDIENTES POR SECC. CERTIF. Y HABILIT.PROF.'
    @06,01 say 'Matricula:       Categor¡a:    Nombre:'
    @11,01 say 'Texto variable:'
    wmatri=0
    wcateg=space(2)
    @23,01 say 'Indique Nro.de matricula o 99999 para salir'
    @06,12 get wmatri pict '99999'
    read
    if wmatri<>99999
      @23, 01 clear to 23,78
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
            worden=0
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
               wnomtit=space(15)
            endif
            select 1                  
            wexcod=space(1)
            wexnro=0
            wexano=0 
            wfechl=space(22)
            wenc1=space(16)
            wenc2=space(64)
            wenc3=space(64)
            wenc4=space(64)
            wenc5=space(64)
            wenc6=space(64)
            wop2=1
            @23, 01 clear to 23,78
                     @12,1 get wenc1
                     @13,1 get wenc2
                     @14,1 get wenc3
                     @15,1 get wenc4
                     @16,1 get wenc5
                     @17,1 get wenc6
                     read
            endif
            select 1
         endif
         wcopias=1
         @21,01 say 'Indique cantidad de copias (m¡nimo = 1)'
         @21,40 get wcopias pict '99'
         read
         wop=1
         @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
            set printer to lpt1
            set console off
            set printer on
            set device to printer
            @23,01 clear to 23,78
            wop2=1
            @23,30 get wop2 pict '@*H \<Epson;\<Laser' size 1,1
            read
            if wop2=2
               ?? chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
            endif   
*               wcopias=2
            do while wcopias>0
               ?'     CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
*                  ?'                    M E N D O Z A'
               ?'     Decreto Ley N§ 3485/63  -  Ley N§ 5908  y  Ley  N§ 6377'
               ?
               ?
               ?'MENDOZA,' at 37
               ??day(date()) pict '99' at 46
               ??' de '    at 48 
               ??wmeses(month(date())) at 52
               ??' de '    at 61
               ??year(date()) at 65
               ?
               ?
               ?
               ?chr(27)+chr(71)
               ?? '     Sr.Secretario del' 
               ?  '     CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
               ?  '     Ing. SERGIO EDUARDO GONZALEZ'
               ?  '     S.                  /                      D'
               ?  '     ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
               ??chr(27)+chr(72)
               ?
               ?
               ?  '                                                  Secci¢n Certificado'
               ?  '     de Habilitaci¢n Profesional se dirige a Ud. con el objeto de In-'
               ?  '     formarle que hasta la fecha el Profesional:'  
               ?  '      ** '
               ?? wnomtit
               ?? ' '
               ?? nombre
               ?  '      **  Matr¡cula N§ '
               ??wmatri pict '99999'
               ??',  Cat. '
               ?? wcateg pict 'XX'
               ?  '     NO ha dado cumplimiento a los requerimientos de '                
               ?? wenc1 
               if wenc2<>space(64)
                  ? wenc2 at 5
               endif
               if wenc3<>space(64)   
                  ? wenc3 at 5
               endif   
               if wenc4<>space(64)
                  ? wenc4 at 5
               endif
               if wenc5<>space(64)   
                  ? wenc5 at 5
               endif
               if wenc6<>space(64)   
                  ? wenc6 at 5
               endif   
               ?
               ?  'n9                                                Sin otro particular'
               ?  '     saludo a Ud. atentamente.-                                      '
               ?
               ?
               ?
               wcopias=wcopias-1
               eject
            enddo
               set printer off
               set device to screen
            endif  
         else
            @06, 40 say 'No existe'  
         endif
*      endif
*  endif    
enddo
@04,01 clear to 23,78
close all      