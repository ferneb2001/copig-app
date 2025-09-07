procedure spaamen
* Actualizacion archivo de Entidades
set talk off
wsigue='S'
wnumero=0
set exclusive off
*set multilocks on
wcatego=space(2)
wnom=space(55)
wtit=0
wfincr={  /  /  }
wftit={  /  /  }
wpago={  /  /  }
wfecb=0
wfeccert={  /  /  }
wkey=space(7)
select 1
use spentie index spentid, spentien 
select 2
use spmentie index spmentie
@04,01 clear to 23,78
@06,02 say 'Matricula'
@06,20 say 'Categ.:'
@04,25 say 'ACTUALIZACION DE ENTIDADES'
do while wsigue='S'
   @05,01 clear to 23,78
   @06,02 say 'Matricula'
   @06,20 say 'Categ.:'
   do pant01
   select 1
   use spentie index spentid, spentien 
   select 2
   use spmentie index spmentie
   wnumero=0
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @06,13 get wnumero pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<> 27
      @23,01 say 'Indique la categoria'
      @06,28 get wcatego pict '!!'
      read
      if wcatego = 'EM'
      wkey=str(wnumero,5)+wcatego
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         use spentie index spentid
         seek(wkey1)
         if found()
            do pant01
            @ 07,20 say nombre
             select 2
             @10,17 say b.inscr
             @14,17 say b.pago
             @16,17 say b.habili
             wop=2
             do while wop<>1
                @23,25 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos';
                       size 1,1 
                read
                @23,01 clear to 23,78
                if wop=2
                   do modifica1
                else
                   if wop=3
                      do otros
                      wop=3
                   endif
                endif         
                @23,01 clear to 23,78
             enddo       
         else
            @06,60 SAY 'SIN DATOS PERSONALES'
         endif      
      else
         *@06,60 say 'No encontro'
         DO INGRESEM with wnumero, wcatego
      endif
      else
         @23,01 say 'mal numero de matricula'
      endif   
   else
      wsigue='N'
   endif
enddo
close all
@04,01 clear to 23,78
return

procedure pant01
@ 08,01 clear to 23,78
@10,02 say 'Fecha Matric:'
@14,02 say  'Fecha Pago  :'
@16,02 say 'Fecha Hab.  :'
@20,02 say 'Cod.Inscrip.:'
return

procedure modifica1
wnom=a.nombre
*wtit=b.titulo
wfincr=b.inscr
*wftit=b.fectit
wpago=b.pago
wfecb=b.habili
@07,20 get wnom
@10,17 get wfincr
*@12,17 get wftit
@14,17 get wpago
@16,17 get wfecb
*@18,17 get wfeccert
read
replace a.nombre  with wnom
*replace b.titulo  with wtit
replace b.inscr   with wfincr
*replace b.fectit  with wftit
replace b.pago    with wpago
replace b.habili  with wfecb
*replace b.feccert with wfeccert
@23,01 clear to 23,78
return

procedure otros
wotro=0
@17,54 to 23,77
@17,60 say 'Otros datos'
@18,55 get wotro picture '@* \<Datos Personales;\<Salir';
                          size 1,1
read
@17,54 clear to 23,78
do case
   case wotro = 1
      do personen with wkey
endcase   
return


